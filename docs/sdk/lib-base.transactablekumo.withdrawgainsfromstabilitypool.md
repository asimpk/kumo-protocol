<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@kumodao/lib-base](./lib-base.md) &gt; [TransactableKumo](./lib-base.transactablekumo.md) &gt; [withdrawGainsFromStabilityPool](./lib-base.transactablekumo.withdrawgainsfromstabilitypool.md)

## TransactableKumo.withdrawGainsFromStabilityPool() method

Withdraw [collateral gain](./lib-base.stabilitydeposit.collateralgain.md) and [KUMO reward](./lib-base.stabilitydeposit.kumoreward.md) from Stability Deposit.

<b>Signature:</b>

```typescript
withdrawGainsFromStabilityPool(asset: string): Promise<StabilityPoolGainsWithdrawalDetails>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  asset | string |  |

<b>Returns:</b>

Promise&lt;[StabilityPoolGainsWithdrawalDetails](./lib-base.stabilitypoolgainswithdrawaldetails.md)<!-- -->&gt;

## Exceptions

Throws [TransactionFailedError](./lib-base.transactionfailederror.md) in case of transaction failure.

