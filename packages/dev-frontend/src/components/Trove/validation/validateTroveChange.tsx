import React from "react";
import {
  Decimal,
  KUSD_MINIMUM_DEBT,
  KUSD_MINIMUM_NET_DEBT,
  Trove,
  TroveAdjustmentParams,
  TroveChange,
  Percent,
  MINIMUM_COLLATERAL_RATIO,
  CRITICAL_COLLATERAL_RATIO,
  TroveClosureParams,
  TroveCreationParams
} from "@kumodao/lib-base";
import { useLocation } from "react-router-dom";

import { COIN } from "../../../strings";

import { ActionDescription, Amount } from "../../ActionDescription";
import { ErrorDescription } from "../../ErrorDescription";

const mcrPercent = new Percent(MINIMUM_COLLATERAL_RATIO).toString(0);
const ccrPercent = new Percent(CRITICAL_COLLATERAL_RATIO).toString(0);

type TroveAdjustmentDescriptionParams = {
  params: TroveAdjustmentParams<Decimal>;
};

const getPathName = (location: any) => {
  return location && location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
};

let unit: string = "";

const TroveChangeDescription: React.FC<TroveAdjustmentDescriptionParams> = ({ params }) => {
  const location = useLocation();
  unit = getPathName(location).toUpperCase();
  return (
    <ActionDescription>
      {params.depositCollateral && params.borrowKUSD ? (
        <>
          You will deposit{" "}
          <Amount>
            {params.depositCollateral.prettify()} {unit}
          </Amount>{" "}
          and receive{" "}
          <Amount>
            {params.borrowKUSD.prettify()} {COIN}
          </Amount>
        </>
      ) : params.repayKUSD && params.withdrawCollateral ? (
        <>
          You will pay{" "}
          <Amount>
            {params.repayKUSD.prettify()} {COIN}
          </Amount>{" "}
          and receive{" "}
          <Amount>
            {params.withdrawCollateral.prettify()} {unit}
          </Amount>
        </>
      ) : params.depositCollateral && params.repayKUSD ? (
        <>
          You will deposit{" "}
          <Amount>
            {params.depositCollateral.prettify()} {unit}
          </Amount>{" "}
          and pay{" "}
          <Amount>
            {params.repayKUSD.prettify()} {COIN}
          </Amount>
        </>
      ) : params.borrowKUSD && params.withdrawCollateral ? (
        <>
          You will receive{" "}
          <Amount>
            {params.withdrawCollateral.prettify()} {unit}
          </Amount>{" "}
          and{" "}
          <Amount>
            {params.borrowKUSD.prettify()} {COIN}
          </Amount>
        </>
      ) : params.depositCollateral ? (
        <>
          You will deposit{" "}
          <Amount>
            {params.depositCollateral.prettify()} {unit}
          </Amount>
        </>
      ) : params.withdrawCollateral ? (
        <>
          You will receive{" "}
          <Amount>
            {params.withdrawCollateral.prettify()} {unit}
          </Amount>
        </>
      ) : params.borrowKUSD ? (
        <>
          You will receive{" "}
          <Amount>
            {params.borrowKUSD.prettify()} {COIN}
          </Amount>
        </>
      ) : (
        <>
          You will pay{" "}
          <Amount>
            {params.repayKUSD.prettify()} {COIN}
          </Amount>
        </>
      )}
      .
    </ActionDescription>
  );
};

// export const selectForTroveChangeValidation = ({
//   price,
//   total,
//   accountBalance,
//   kusdBalance,
//   numberOfTroves
// }: KumoStoreState) => ({ price, total, accountBalance, kusdBalance, numberOfTroves });
type TroveChangeValidationSelectedStateType = {
  price: Decimal;
  total: Trove;
  accountBalance: Decimal;
  kusdBalance: Decimal;
  numberOfTroves: Number;
};

// type TroveChangeValidationSelectedState = ReturnType<typeof selectForTroveChangeValidation>;
type TroveChangeValidationSelectedState = TroveChangeValidationSelectedStateType;

interface TroveChangeValidationContext extends TroveChangeValidationSelectedState {
  originalTrove: Trove;
  resultingTrove: Trove;
  recoveryMode: boolean;
  wouldTriggerRecoveryMode: boolean;
}

export const validateTroveChange = (
  originalTrove: Trove,
  adjustedTrove: Trove,
  borrowingRate: Decimal,
  selectedState: TroveChangeValidationSelectedState
): [
  validChange: Exclude<TroveChange<Decimal>, { type: "invalidCreation" }> | undefined,
  description: JSX.Element | undefined
] => {
  const { total, price } = selectedState;
  const change = originalTrove.whatChanged(adjustedTrove, borrowingRate);

  if (!change) {
    return [undefined, undefined];
  }

  // Reapply change to get the exact state the Trove will end up in (which could be slightly
  // different from `edited` due to imprecision).
  const resultingTrove = originalTrove.apply(change, borrowingRate);
  const recoveryMode = total.collateralRatioIsBelowCritical(price);
  const wouldTriggerRecoveryMode = total
    .subtract(originalTrove)
    .add(resultingTrove)
    .collateralRatioIsBelowCritical(price);

  const context: TroveChangeValidationContext = {
    ...selectedState,
    originalTrove,
    resultingTrove,
    recoveryMode,
    wouldTriggerRecoveryMode
  };

  if (change.type === "invalidCreation") {
    // Trying to create a Vault with negative net debt
    return [
      undefined,
      <ErrorDescription>
        Total debt must be at least{" "}
        <Amount>
          {KUSD_MINIMUM_DEBT.toString()} {COIN}
        </Amount>
        .
      </ErrorDescription>
    ];
  }

  const errorDescription =
    change.type === "creation"
      ? validateTroveCreation(change.params, context)
      : change.type === "closure"
      ? validateTroveClosure(change.params, context)
      : validateTroveAdjustment(change.params, context);

  if (errorDescription) {
    return [undefined, errorDescription];
  }

  return [change, <TroveChangeDescription params={change.params} />];
};

const validateTroveCreation = (
  { depositCollateral, borrowKUSD }: TroveCreationParams<Decimal>,
  {
    resultingTrove,
    recoveryMode,
    wouldTriggerRecoveryMode,
    accountBalance,
    price
  }: TroveChangeValidationContext
): JSX.Element | null => {
  if (borrowKUSD.lt(KUSD_MINIMUM_NET_DEBT)) {
    return (
      <ErrorDescription>
        You must borrow at least{" "}
        <Amount>
          {KUSD_MINIMUM_NET_DEBT.toString()} {COIN}
        </Amount>
        .
      </ErrorDescription>
    );
  }

  if (recoveryMode) {
    if (!resultingTrove.isOpenableInRecoveryMode(price)) {
      return (
        <ErrorDescription>
          You're not allowed to open a Vault with less than <Amount>{ccrPercent}</Amount> Collateral
          Ratio during recovery mode. Please increase your Vault's Collateral Ratio.
        </ErrorDescription>
      );
    }
  } else {
    if (resultingTrove.collateralRatioIsBelowMinimum(price)) {
      return (
        <ErrorDescription>
          Collateral ratio must be at least <Amount>{mcrPercent}</Amount>.
        </ErrorDescription>
      );
    }

    if (wouldTriggerRecoveryMode) {
      return (
        <ErrorDescription>
          You're not allowed to open a Vault that would cause the Total Collateral Ratio to fall
          below <Amount>{ccrPercent}</Amount>. Please increase your Vault's Collateral Ratio.
        </ErrorDescription>
      );
    }
  }

  if (depositCollateral.gt(accountBalance)) {
    return (
      <ErrorDescription>
        The amount you're trying to deposit exceeds your balance by{" "}
        <Amount>
          {depositCollateral.sub(accountBalance).prettify()} {unit}
        </Amount>
        .
      </ErrorDescription>
    );
  }

  return null;
};

const validateTroveAdjustment = (
  { depositCollateral, withdrawCollateral, borrowKUSD, repayKUSD }: TroveAdjustmentParams<Decimal>,
  {
    originalTrove,
    resultingTrove,
    recoveryMode,
    wouldTriggerRecoveryMode,
    price,
    accountBalance,
    kusdBalance
  }: TroveChangeValidationContext
): JSX.Element | null => {
  if (recoveryMode) {
    if (withdrawCollateral) {
      return (
        <ErrorDescription>
          You're not allowed to withdraw collateral during recovery mode.
        </ErrorDescription>
      );
    }

    if (borrowKUSD) {
      if (resultingTrove.collateralRatioIsBelowCritical(price)) {
        return (
          <ErrorDescription>
            Your collateral ratio must be at least <Amount>{ccrPercent}</Amount> to borrow during
            recovery mode. Please improve your collateral ratio.
          </ErrorDescription>
        );
      }

      if (resultingTrove.collateralRatio(price).lt(originalTrove.collateralRatio(price))) {
        return (
          <ErrorDescription>
            You're not allowed to decrease your collateral ratio during recovery mode.
          </ErrorDescription>
        );
      }
    }
  } else {
    if (resultingTrove.collateralRatioIsBelowMinimum(price)) {
      return (
        <ErrorDescription>
          Collateral ratio must be at least <Amount>{mcrPercent}</Amount>.
        </ErrorDescription>
      );
    }

    if (wouldTriggerRecoveryMode) {
      return (
        <ErrorDescription>
          The adjustment you're trying to make would cause the Total Collateral Ratio to fall below{" "}
          <Amount>{ccrPercent}</Amount>. Please increase your Vault's Collateral Ratio.
        </ErrorDescription>
      );
    }
  }

  if (repayKUSD) {
    if (resultingTrove.debt.lt(KUSD_MINIMUM_DEBT)) {
      return (
        <ErrorDescription>
          Total debt must be at least{" "}
          <Amount>
            {KUSD_MINIMUM_DEBT.toString()} {COIN}
          </Amount>
          .
        </ErrorDescription>
      );
    }

    if (repayKUSD.gt(kusdBalance)) {
      return (
        <ErrorDescription>
          The amount you're trying to repay exceeds your balance by{" "}
          <Amount>
            {repayKUSD.sub(kusdBalance).prettify()} {COIN}
          </Amount>
          .
        </ErrorDescription>
      );
    }
  }

  if (depositCollateral?.gt(accountBalance)) {
    return (
      <ErrorDescription>
        The amount you're trying to deposit exceeds your balance by{" "}
        <Amount>
          {depositCollateral.sub(accountBalance).prettify()} {unit}
        </Amount>
        .
      </ErrorDescription>
    );
  }

  return null;
};

const validateTroveClosure = (
  { repayKUSD }: TroveClosureParams<Decimal>,
  {
    recoveryMode,
    wouldTriggerRecoveryMode,
    numberOfTroves,
    kusdBalance
  }: TroveChangeValidationContext
): JSX.Element | null => {
  if (numberOfTroves === 1) {
    return (
      <ErrorDescription>
        You're not allowed to close your Vault when there are no other Vaults in the system.
      </ErrorDescription>
    );
  }

  if (recoveryMode) {
    return (
      <ErrorDescription>
        You're not allowed to close your Vault during recovery mode.
      </ErrorDescription>
    );
  }

  if (repayKUSD?.gt(kusdBalance)) {
    return (
      <ErrorDescription>
        You need{" "}
        <Amount>
          {repayKUSD.sub(kusdBalance).prettify()} {COIN}
        </Amount>{" "}
        more to close your Vault.
      </ErrorDescription>
    );
  }

  if (wouldTriggerRecoveryMode) {
    return (
      <ErrorDescription>
        You're not allowed to close a Vault if it would cause the Total Collateralization Ratio to
        fall below <Amount>{ccrPercent}</Amount>. Please wait until the Total Collateral Ratio
        increases.
      </ErrorDescription>
    );
  }

  return null;
};
