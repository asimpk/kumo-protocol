import { Decimal, Trove } from "@kumodao/lib-base";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Progress, Box, Card, Text, Heading } from "theme-ui";
import { useTroveView } from "../Trove/context/TroveViewContext";
import { InfoIcon } from "../InfoIcon";

type CollateralCardProps = {
  collateralType?: string;
  vaultName: string;
  totalCollateralRatioPct: string;
  total: Trove;
  kusdInStabilityPool: Decimal;
  borrowingRate: Decimal;
  kusdMintedCap: Decimal;
};

export const CollateralCard: React.FC<CollateralCardProps> = ({
  collateralType,
  vaultName,
  totalCollateralRatioPct,
  total,
  kusdInStabilityPool,
  borrowingRate,
  kusdMintedCap
}) => {
  const { dispatchEvent, view } = useTroveView();
  const navigate = useNavigate();

  const handleClick = () => {
    if (view === "ADJUSTING") {
      dispatchEvent("CANCEL_ADJUST_TROVE_PRESSED");
    }
    navigate(`/dashboard/${collateralType}`);
  };
  return (
    <Card variant="collateralCard" sx={{ mb: 5 }} onClick={() => handleClick()}>
      <Heading as="h2">{collateralType?.toUpperCase()} Vault <Text variant="assetName">({vaultName})</Text></Heading>
      <Box sx={{ px: 5, mt: 5 }}>
        <Text as="p" variant="normalBold">
          TOTAL COLLATERAL RATIO{" "}
          <InfoIcon
            tooltip={
              <Card variant="tooltip" sx={{ width: "220px" }}>
                {`The Total Collateral Ratio or TCR is the ratio of the Dollar value of the entire
                system collateral at the current ${collateralType?.toUpperCase()}:USD price, to the entire system debt.`}
              </Card>
            }
          />
        </Text>

        <Text as="p" variant="xlarge" sx={{ mt: 1 }}>
          {totalCollateralRatioPct}
        </Text>
        <Flex sx={{ justifyContent: "space-between", mt: 6, flexWrap: 'wrap' }}>
          <Text as="p" variant="normalBold">
            MINTED KUSD
          </Text>
          <Text as="p" variant="normalBold">
            {total?.debt.prettify(0)}
          </Text>
        </Flex>
        <Box sx={{ my: 2 }}>
          <Progress
            max={kusdMintedCap.toString()}
            value={total?.debt.toString()}
            sx={{ height: "12px", backgroundColor: "#F0CFDC" }}
          ></Progress>
        </Box>
        <Flex sx={{ justifyContent: "space-between", mb: 3, flexWrap: 'wrap' }}>
          <Text as="p" variant="normalBold">
            MINT CAP
          </Text>
          <Text as="p" variant="normalBold">
            {kusdMintedCap.shorten().toString().toLowerCase()}
          </Text>
        </Flex>
        <Flex sx={{ justifyContent: "space-between", mb: 1, flexWrap: 'wrap' }}>
          <Text as="p" variant="normalBold">
            KUSD in Stability Pool
          </Text>
          <Text as="p" variant="normalBold">
            {kusdInStabilityPool.prettify(0)}
          </Text>
        </Flex>
        <Flex sx={{ justifyContent: "space-between", mb: 4, flexWrap: 'wrap' }}>
          <Text as="p" variant="normalBold">
            Borrowing Rate
          </Text>
          <Text as="p" variant="normalBold">
            {`${borrowingRate.mul(100).prettify(2)}%`}
          </Text>
        </Flex>
      </Box>
    </Card>
  );
};
