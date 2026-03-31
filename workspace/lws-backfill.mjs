import https from 'https';

const MONDAY_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU1OTg5ODM2NSwiYWFpIjoxMSwidWlkIjo2MTAxNTA4MSwiaWFkIjoiMjAyNS0wOS0wOVQxMzo1Mzo1NC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6ODA1MTIzOSwicmduIjoidXNlMSJ9.8EeSvD13m-TL7qih7lsfRI8lL40ulfGx1uIktdh47cs';
const SOURCE_BOARD = '18335730285';
const DEST_BOARD = '18292177897';
const SKIP_ITEM_ID = '11356176128';

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const options = {
      hostname: 'api.monday.com',
      path: '/v2',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': MONDAY_API_KEY,
        'api-version': '2023-10',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchAllItems() {
  const allItems = [];
  let cursor = null;
  let page = 0;

  while (true) {
    page++;
    console.log(`Fetching page ${page}${cursor ? ' (cursor)' : ''}...`);

    let query;
    if (!cursor) {
      query = `{
        boards(ids: [${SOURCE_BOARD}]) {
          items_page(limit: 50) {
            cursor
            items {
              id
              name
              column_values(ids: ["board_relation_mm1yqvka", "lead_phone", "lead_email", "text_mkypxc20"]) {
                id
                value
                text
              }
            }
          }
        }
      }`;
    } else {
      query = `{
        next_items_page(limit: 50, cursor: "${cursor}") {
          cursor
          items {
            id
            name
            column_values(ids: ["board_relation_mm1yqvka", "lead_phone", "lead_email", "text_mkypxc20"]) {
              id
              value
              text
            }
          }
        }
      }`;
    }

    let result;
    let retries = 0;
    while (retries < 5) {
      result = await gql(query);
      if (result.status === 429) {
        console.log('Rate limited, waiting 10s...');
        await sleep(10000);
        retries++;
        continue;
      }
      if (result.body.errors) {
        console.error('GraphQL errors:', JSON.stringify(result.body.errors));
        throw new Error('GraphQL error');
      }
      break;
    }

    let pageData;
    if (!cursor) {
      pageData = result.body.data?.boards?.[0]?.items_page;
    } else {
      pageData = result.body.data?.next_items_page;
    }

    if (!pageData) {
      console.error('No page data:', JSON.stringify(result.body));
      break;
    }

    const items = pageData.items || [];
    console.log(`  Got ${items.length} items`);
    allItems.push(...items);

    cursor = pageData.cursor;
    if (!cursor || items.length === 0) {
      console.log('No more pages.');
      break;
    }

    await sleep(300); // small delay between pages
  }

  return allItems;
}

function getColValue(item, colId) {
  const col = item.column_values.find(c => c.id === colId);
  return col ? (col.value || null) : null;
}

function getColText(item, colId) {
  const col = item.column_values.find(c => c.id === colId);
  return col ? (col.text || '') : '';
}

function parsePhone(rawValue) {
  if (!rawValue || rawValue === 'null') return null;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed.phone || null;
  } catch {
    return rawValue.trim() || null;
  }
}

function parseEmail(rawValue) {
  if (!rawValue || rawValue === 'null') return null;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed.email || parsed.text || null;
  } catch {
    return rawValue.trim() || null;
  }
}

async function createContact(name, phone, email, salesRep) {
  const columnValues = {};

  if (phone) {
    columnValues['phone_mm1y1e37'] = { phone: phone, countryShortName: 'US' };
  }
  if (email) {
    columnValues['email_mm1yd8wn'] = { email: email, text: email };
  }
  if (salesRep) {
    columnValues['text_mm1y6rn2'] = salesRep;
  }

  const colValStr = JSON.stringify(JSON.stringify(columnValues));

  const mutation = `mutation {
    create_item(
      board_id: ${DEST_BOARD},
      item_name: ${JSON.stringify(name)},
      column_values: ${colValStr}
    ) {
      id
      name
    }
  }`;

  let retries = 0;
  while (retries < 5) {
    const result = await gql(mutation);
    if (result.status === 429) {
      console.log('Rate limited on create, waiting 15s...');
      await sleep(15000);
      retries++;
      continue;
    }
    if (result.body.errors) {
      return { success: false, error: JSON.stringify(result.body.errors) };
    }
    const created = result.body.data?.create_item;
    if (created) {
      return { success: true, id: created.id };
    }
    return { success: false, error: JSON.stringify(result.body) };
  }
  return { success: false, error: 'Max retries hit' };
}

async function main() {
  console.log('=== LWS Contacts Backfill ===');
  console.log(`Source board: ${SOURCE_BOARD}`);
  console.log(`Destination board: ${DEST_BOARD}`);
  console.log('');

  console.log('Step 1: Fetching all items from source board...');
  const allItems = await fetchAllItems();
  console.log(`Total items fetched: ${allItems.length}`);
  console.log('');

  // Filter: missing contact link
  const itemsMissingContact = allItems.filter(item => {
    const contactVal = getColValue(item, 'board_relation_mm1yqvka');
    if (!contactVal || contactVal === 'null') return true;
    try {
      const parsed = JSON.parse(contactVal);
      // board_relation value is typically {"linkedPulseIds": [...]}
      if (parsed.linkedPulseIds && parsed.linkedPulseIds.length > 0) return false;
      return true;
    } catch {
      return !contactVal.trim();
    }
  });

  console.log(`Items missing contact link: ${itemsMissingContact.length}`);
  console.log('');

  let totalProcessed = 0;
  let totalCreated = 0;
  let skippedAlreadyDone = 0;
  let skippedNoData = 0;
  let errors = [];

  for (const item of itemsMissingContact) {
    totalProcessed++;

    // Skip Josh Long test item
    if (item.id === SKIP_ITEM_ID) {
      console.log(`[SKIP] ${item.name} (ID: ${item.id}) — already done as test`);
      skippedAlreadyDone++;
      continue;
    }

    const phoneRaw = getColValue(item, 'lead_phone');
    const emailRaw = getColValue(item, 'lead_email');
    const salesRepText = getColText(item, 'text_mkypxc20');

    const phone = parsePhone(phoneRaw);
    const email = parseEmail(emailRaw);
    const salesRep = salesRepText.trim() || null;

    // Skip if both phone and email are empty
    if (!phone && !email) {
      console.log(`[SKIP] ${item.name} (ID: ${item.id}) — no phone or email`);
      skippedNoData++;
      continue;
    }

    console.log(`[CREATE] ${item.name} | phone: ${phone || 'none'} | email: ${email || 'none'} | rep: ${salesRep || 'none'}`);

    const result = await createContact(item.name, phone, email, salesRep);

    if (result.success) {
      console.log(`  → Created ID: ${result.id}`);
      totalCreated++;
    } else {
      console.log(`  → ERROR: ${result.error}`);
      errors.push({ item: item.name, id: item.id, error: result.error });
    }

    await sleep(200); // small delay between creates
  }

  console.log('');
  console.log('=== SUMMARY ===');
  console.log(`Total items on source board: ${allItems.length}`);
  console.log(`Items missing contact link: ${itemsMissingContact.length}`);
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`New records created: ${totalCreated}`);
  console.log(`Skipped (already done): ${skippedAlreadyDone}`);
  console.log(`Skipped (no phone/email): ${skippedNoData}`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length > 0) {
    console.log('Error details:');
    errors.forEach(e => console.log(`  - ${e.item} (${e.id}): ${e.error}`));
  }
}

main().catch(console.error);
