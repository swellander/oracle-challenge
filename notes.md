### Outline
1. Suuuper simple oracle?
   1. centralized
   2. single source updating a smart contract
   3. Pitfalls:
      1. single point of failure
2. Maker Dao whitelisted validators
   1. More decentralized, but relying on whitelist
   2. Reliable/premium sources
   3. Pitfalls:
      1. Entirely trust-based
         1. Node operators could collude
      2. No financial incentives
3. Schelling Point systems
   1. Nodes rewarded for being close to the median
   2. Punished for reporting outlier data or not reporting
   3. Setting some threshold to define outlier values
4. Reputation based system?
   1. Requires node operators to stake value
   2. Incentivizes the operators to supply data?
      1. Not sure if this is important
      2. Could maybe redistribute slashed funds?
   3. Node operators are now responsible for reporting their own data, rather than the main oracle querying them.
      1. Main oracle doesn't have to trust that timestamp is accurate 
5. Decentralized operator network
   1. Maybe as extra credit

### Misc Ideas of what to include
- Intro to [the oracle problem](https://chain.link/education-hub/oracle-problem)
  - The blockchain oracle problem refers to the inability of blockchains to access external data, making them isolated networks, akin to a computer with no Internet connection. Bridging the connection between the blockchain (onchain) and the outside world (offchain) requires an additional piece of infrastructure—an oracle.
- Decentralized Oracle Networks (DONs)


### To Consider
1. Might be a better design to cache the price, allowing a free read. Then have a separate validate() function that gets called regularly by an admin, to filter out bad data


### FE ideas
1. Changes to the finalized price could be highlighted in a color that corresponds to how big of a swing? Or how far the price is from the median?
2. Add sliders to each node, inaccurate(malicious) <==> accurate(honest)
3. User can see how each contract evolution further stabilizes the price. 
