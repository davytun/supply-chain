import { Client, TopicCreateTransaction, PrivateKey, AccountId } from '@hashgraph/sdk';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function createTopic() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  
  if (!accountId || !privateKey) {
    console.error('Please set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY');
    return;
  }

  const client = Client.forTestnet();
  
  // Try different private key formats
  let key;
  try {
    // Try as DER-encoded first
    key = PrivateKey.fromStringDer(privateKey);
  } catch {
    try {
      // Try as ECDSA
      key = PrivateKey.fromStringECDSA(privateKey);
    } catch {
      // Fallback to ED25519
      key = PrivateKey.fromStringED25519(privateKey);
    }
  }
  
  client.setOperator(AccountId.fromString(accountId), key);

  const transaction = new TopicCreateTransaction()
    .setTopicMemo('Supply Chain Events Topic');

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  
  console.log(`HEDERA_TOPIC_ID=${receipt.topicId}`);
  client.close();
}

createTopic().catch(console.error);