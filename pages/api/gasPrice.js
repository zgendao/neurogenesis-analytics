const axios = require("axios");
/* 
export default async (req, res) => {
  const data = await getGasPrice();
  res.status(200).json(data);
};
 */
async function getGasPrice() {
  const gasPrices = {};
  const apiKey = "M4BRH3BDSA6DUPA3BSJX3D5276IAGTVJKQ";
  const [
    {
      data: {
        result: { SafeGasPrice: low, ProposeGasPrice: avg, FastGasPrice: high },
      },
    },
    {
      data: {
        result: { ethusd },
      },
    },
  ] = await Promise.all([
    axios.get(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=" +
        apiKey
    ),
    axios.get(
      "https://api.etherscan.io/api?module=stats&action=ethprice&apikey=" +
        apiKey
    ),
  ]);

  for (const [key, value] of Object.entries({ low, avg, high })) {
    const {
      data: { result: time },
    } = await axios.get(
      "https://api.etherscan.io/api?module=gastracker&action=gasestimate&gasprice=" +
        value +
        "000000000&apikey=" +
        apiKey
    );
    gasPrices[key] = {};
    gasPrices[key].gwei = parseInt(value);
    gasPrices[key].time = parseInt(time);
    gasPrices[key].price = parseInt(value) * 0.000000001 * 21000 * ethusd;
  }

  return gasPrices;
}
