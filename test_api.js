const axios = require('axios');


async function main() {
    while (true) {
        await axios.get("http://localhost:5000/api/v1/info").then(response => console.log(response.data))
        await axios.post("http://localhost:5000/api/v1/pages", { name: "Page 1" }).then(response => console.log(response.data));
        await axios.get("http://localhost:5000/api/v1/pages?quantity=2").then(response => console.log(response.data))
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    }
}

main();