const chai = require('chai');

const MultiSigWallet = artifacts.require('MultiSigWallet');

contract('MultiSigWallet', accounts => {
  const owners = [accounts[0], accounts[1], accounts[2]];
  const NUM_CONFIRMATIONS_REQUIRED = 2;

  let wallet;

  beforeEach(async () => {
    wallet = await MultiSigWallet.new(owners, NUM_CONFIRMATIONS_REQUIRED);
  });

  it('should execute transaction', async () => {
    let to = owners[0];
    let value = 0;
    let data = "0x0";
    await wallet.submitTransaction(to, value, data);
    await wallet.confirmTransaction(0, {from: owners[0]});
    await wallet.confirmTransaction(0, {from: owners[1]});

    const result = await wallet.executeTransaction(0, {from: owners[0]});
    const { logs } = result;
    const transaction = await wallet.getTransaction(0);

    assert.equal(logs[0].event, "ExecuteTransaction");
    assert.equal(logs[0].args.owner, owners[0]);
    assert.equal(logs[0].args.txIndex, 0);
    assert.equal(transaction.executed, true);
  });
});