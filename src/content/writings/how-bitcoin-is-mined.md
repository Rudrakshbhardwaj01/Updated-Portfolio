---
title: "How Bitcoin Is Mined"
date: "2025-08-15"
description: "A beginner-friendly explanation of Bitcoin mining."
category: "Blockchain"
---
# How Bitcoin is Mined: A Beginner’s POV

<img
  src="/assets/poster3_new.png"
  alt="Bitcoin Banner"
  class="poster3"
/>

Have you ever thought, *"How on Earth does a new bitcoin come into existence?"* or *"How do bitcoin transactions take place?"* If yes, then this blog is the answer to your questions.

The blog expects you to have an elementary understanding of what blockchain and Bitcoin are. All the foreign terms will be explained as we move forward. So without any further ado, let's dive in!

---

Suppose you are Alice. You own some amount of bitcoins in the form of **UTXOs (Unspent Transaction Outputs)**—the amount of bitcoins that you haven't used yet from your previous transactions—in your wallet, a digital space where your cryptocurrencies are stored.

Your friend Bob needs a sum of **5 BTC** (the currency unit of Bitcoin). So, you make a transaction of 5 BTC from your wallet to Bob's wallet.

Once you've initiated the transaction, you broadcast it to the other nodes present in the P2P network. Each receiving node then checks whether the transaction is valid, i.e.:

- Whether you have enough UTXOs.
- Whether the transaction was signed using your private key.
- Whether it follows Bitcoin's consensus rules.

Once the transaction is validated, each node adds it to its **mempool**—a waiting area for pending Bitcoin transactions. Every node maintains its own mempool.

Miners, who are special participants in the network and are responsible for mining bitcoins, browse their nodes' mempools for transactions. They usually pick the transactions offering the highest transaction fees first since that is their incentive.

> Transaction Fee = Total Input − Total Output

(The output includes any change returned to the sender.)

The selected transactions are bundled into what is called a **candidate block**.

This block also contains the **coinbase transaction**—the miner's reward for finding a valid block. The reward consists of:

- The fixed block reward.
- All selected transaction fees.

The miner's goal is now to find a hash that meets Bitcoin's Proof-of-Work requirement.

The current fixed coin reward for miners is **3.125 BTC**, which halves every four years. This is done to ensure there is only a limited supply of Bitcoin in the world—**21 million BTC** in total.

Based on Bitcoin's halving schedule, by the year **2140**, the block reward will effectively become zero. After that, miners will earn only transaction fees for processing transactions.

---

## Target

The **target** is a 256-bit number that defines the maximum allowable value for a block's hash in order for it to be considered valid.

If a miner finds a hash that is less than or equal to the target, the block is successfully mined.

The target is automatically adjusted by the Bitcoin protocol every **2,016 blocks** (roughly every two weeks) with no human intervention.

This adjustment ensures that blocks are mined at an average rate of **one block every 10 minutes**.

### If blocks are mined too quickly

- Target decreases.
- Mining becomes harder.
- The hash must be even smaller.

### If blocks are mined too slowly

- Target increases.
- Mining becomes easier.
- The hash can be larger.

Every Bitcoin block contains a **bits field** (compact target) in its header.

When a miner receives the latest valid block from the network, they read this bits value. It tells them the exact target threshold their block hash must be less than or equal to.

In essence, the target acts as a self-adjusting difficulty threshold that keeps Bitcoin's block production consistent over time.

---

## The Mining Process

Coming back to the process of mining, assume a miner has selected your transaction from the mempool along with several other transactions.

A miner creates a **block template** containing:

- Block header
- Transaction details
- Previous block's hash
- Nonce
- Timestamp

### Nonce

The **nonce** is a 32-bit number in the block header that miners change repeatedly in an attempt to find a block hash that satisfies the difficulty target.

### Timestamp

The **timestamp** records the approximate time (in seconds since January 1, 1970 UTC) when the miner created the block.

### Merkle Root

The **Merkle root** can also be altered to generate new hashes, but that topic is beyond the scope of this blog.

Between the nonce and timestamp, miners first exhaust all possible nonce values. Since there are far more possible hashes than available nonce values, if all nonce values are exhausted and no valid hash is found, miners adjust the timestamp and continue searching.

The process continues until a hash less than or equal to the target is discovered.

---

## Block Validation

Once a miner finds the correct hash:

1. The block is considered mined.
2. The miner adds it to their local copy of the blockchain.
3. The block is broadcast to the Bitcoin network.

Other nodes then verify:

- That all transactions are valid.
- That the block's Proof-of-Work satisfies the difficulty target.
- That the block follows current consensus rules.

If the block passes all checks, each node adds it to its own blockchain copy.

The miner receives:

- The block reward (currently 3.125 BTC).
- All transaction fees contained within that block.

Meanwhile, Alice's transaction to Bob is now confirmed on the blockchain, meaning the 5 BTC has officially moved from Alice's wallet to Bob's wallet.

---

# What Is a Hash?

A **hash** is the result of passing data through a hashing algorithm, which transforms readable input into an unreadable string of fixed length.

Unlike encryption, hashing is a **one-way process**—there is no practical way to reverse a hash and recover the original data.

---

## SHA-256 in Bitcoin

Bitcoin uses the **SHA-256 (Secure Hash Algorithm 256-bit)** hashing algorithm.

During mining, miners repeatedly apply SHA-256 twice to the block header, which contains:

- Previous block hash
- Transaction data
- Nonce
- Timestamp
- Other metadata

Each attempt generates a new 256-bit hash.

If the resulting hash is less than or equal to the network's current target value, the block is considered valid.

At that moment:

- The block is successfully mined.
- The hash becomes the block's official identifier.
- The block is added to the blockchain.
- The miner receives the reward.

---

## Conclusion

Bitcoin mining is essentially a global competition to find a hash that satisfies a dynamically adjusted difficulty target.

Miners gather transactions, construct candidate blocks, and perform massive numbers of SHA-256 computations. When a miner finds a valid hash, the block is verified by the network and permanently added to the blockchain.

This process not only secures the Bitcoin network but also controls the issuance of new bitcoins, ensuring that the total supply never exceeds **21 million BTC**.

---

**Tags:** Blockchain, Bitcoin, Computer Science, Web3, Technology