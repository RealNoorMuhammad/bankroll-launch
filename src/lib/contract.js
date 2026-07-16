/** Official $BANKROLL token on Robinhood Chain */
export const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  '0x1c5BE03b4475FBdD678AA2c19904A03C957CB244'

export const CONTRACT_EXPLORER_URL =
  import.meta.env.VITE_CONTRACT_EXPLORER_URL ||
  `https://robinhoodchain.blockscout.com/address/${CONTRACT_ADDRESS}`

export const DEXSCREENER_URL =
  'https://dexscreener.com/robinhood/0x7cd09a8ebde67094ebf9ecf4aa8f119e0b7d5fe3'
