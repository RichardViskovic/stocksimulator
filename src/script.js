const assets = [
    { name: 'Gold', price: 100, volatility: 0.02, prevPrice: 100 },
    { name: 'Bank Deposits', price: 100, volatility: 0.01, prevPrice: 100 },
    { name: 'Stagg Securities', price: 100, volatility: 0.015, prevPrice: 100 },
    { name: 'Campbell Consumables', price: 100, volatility: 0.02, prevPrice: 100 },
    { name: 'Anderson Technologies', price: 100, volatility: 0.03, prevPrice: 100 },
    { name: 'Birch Biotech', price: 100, volatility: 0.05, prevPrice: 100 }
];

const economyMultipliers = {
    boom: 1.2,
    growth: 1.0,
    stagnation: 0.8,
    recession: 0.6,
    depression: 0.4
};

const players = {
    boys: { cash: 1000, holdings: {} },
    girls: { cash: 1000, holdings: {} }
};

let tickCount = 0;

assets.forEach(a => {
    players.boys.holdings[a.name] = 0;
    players.girls.holdings[a.name] = 0;
});

function renderAssets() {
    const tbody = document.getElementById('assetsBody');
    tbody.innerHTML = '';
    assets.forEach((asset, index) => {
        const row = document.createElement('tr');
        const priceClass = asset.price > asset.prevPrice ? 'up' : asset.price < asset.prevPrice ? 'down' : '';
        row.innerHTML = `<td>${asset.name}</td>` +
            `<td class="price ${priceClass}" data-index="${index}">${asset.price.toFixed(2)}</td>` +
            `<td><input type="number" step="0.01" min="0" value="${asset.volatility}" data-volt="${index}"></td>`;
        tbody.appendChild(row);
    });
}

function updateNetWorth() {
    document.querySelectorAll('#portfolioTable tbody tr').forEach(row => {
        const player = row.dataset.player;
        let total = players[player].cash;
        row.querySelectorAll('input[data-asset]').forEach(input => {
            const assetName = input.dataset.asset;
            const units = parseFloat(input.value) || 0;
            players[player].holdings[assetName] = units;
            const price = assets.find(a => a.name === assetName).price;
            total += units * price;
        });
        row.querySelector('.cash').textContent = players[player].cash.toFixed(2);
        row.querySelector('.net').textContent = total.toFixed(2);
    });
}

function handleEdit(e) {
    const input = e.target;
    if (input.tagName !== 'INPUT') return;
    const row = input.closest('tr');
    const player = row.dataset.player;
    const assetName = input.dataset.asset;
    const oldUnits = players[player].holdings[assetName];
    const newUnits = parseFloat(input.value) || 0;
    const diff = newUnits - oldUnits;
    const price = assets.find(a => a.name === assetName).price;
    const cost = diff * price;
    if (diff > 0 && players[player].cash < cost) {
        alert('Not enough cash!');
        input.value = oldUnits;
        return;
    }
    players[player].cash -= cost;
    players[player].holdings[assetName] = newUnits;
    updateNetWorth();
}

document.querySelector('#portfolioTable').addEventListener('change', handleEdit);

document.getElementById('tick').addEventListener('click', () => {
    const econ = document.getElementById('economy').value;
    let inflation = parseFloat(document.getElementById('inflation').value) / 100;
    if (document.getElementById('randomInflation').checked) {
        inflation = Math.random() * 0.05; // up to 5%
        document.getElementById('inflation').value = (inflation * 100).toFixed(2);
    }
    assets.forEach(asset => {
        const voltInput = document.querySelector(`input[data-volt="${assets.indexOf(asset)}"]`);
        asset.volatility = parseFloat(voltInput.value) || asset.volatility;
        asset.prevPrice = asset.price;
        const econImpact = economyMultipliers[econ] * (1 + asset.volatility * 5);
        const baseChange = Math.random() * asset.volatility * 2 - asset.volatility;
        const change = baseChange * econImpact;
        asset.price = Math.max(1, asset.price * (1 + change));
    });

    ['boys', 'girls'].forEach(p => {
        players[p].cash *= 1 - inflation;
    });

    tickCount++;
    document.getElementById('tickCount').textContent = tickCount;

    renderAssets();
    updateNetWorth();
});

renderAssets();
updateNetWorth();
