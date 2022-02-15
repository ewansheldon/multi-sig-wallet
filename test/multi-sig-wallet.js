const chai = require('chai');

const MultiSigWallet = artifacts.require('MultiSigWallet');

contract('MultiSigWallet', accounts => {
  const owners = [accounts[0], accounts[1], accounts[2]];
  const NUM_CONFIRMATIONS_REQUIRED = 2;

  let wallet;

  beforeEach(async () => {
    wallet = await MultiSigWallet.new(owners, NUM_CONFIRMATIONS_REQUIRED);
  });

  describe('executeTransaction', async () => {
    beforeEach(async () => {
      let to = owners[0];
      let value = 0;
      let data = "0x0";
      await wallet.submitTransaction(to, value, data);
      await wallet.confirmTransaction(0, {from: owners[0]});
      await wallet.confirmTransaction(0, {from: owners[1]});
    });

    it('should execute transaction', async () => {
      const result = await wallet.executeTransaction(0, {from: owners[0]});
      const {logs} = result;
      const transaction = await wallet.getTransaction(0);

      assert.equal(logs[0].event, "ExecuteTransaction");
      assert.equal(logs[0].args.owner, owners[0]);
      assert.equal(logs[0].args.txIndex, 0);
      assert.equal(transaction.executed, true);
    });

    it('should not execute transaction, given already executed', async () => {
      await wallet.executeTransaction(0, {from: owners[0]});

      try {
        await wallet.executeTransaction(0, {from: owners[0]});
        throw new Error('transaction did not fail');
      } catch(error) {
        assert.equal(error.reason, 'tx already executed');
      }
    });
  });
});