import React, { useState, ReactNode } from "react";
import { Progress, Alert, Heading } from "theme-ui";
import { useViewBanner } from "../hooks/useViewBanner";
import { Icon } from "./Icon";

export const Banner: React.FC<{ children: ReactNode, bannerHeading: string, visibility: number, viewId: string }> = ({ bannerHeading, visibility, viewId, children }) => {
  const { isViewBannerCheck, changeInProgress } = useViewBanner(visibility, viewId);
  const [isView, setIsView] = useState(true);

  const onClick = () => {
    setIsView(false)
    sessionStorage.setItem(viewId, JSON.stringify(true));
  }


  return (!isViewBannerCheck && isView) ? (
    <Alert
      sx={{
        position: "absolute",
        width: ["55%", "35%"],
        top: 5,
        left: 0,
        right: 0,
        m: "auto",
        p: 3,
        backgroundColor: "#f0cfdc",
        display: "flex",
        flexWrap: 'wrap',
        flexDirection: "column",
        borderRadius: 12,
        alignItems: "flex-start",
        zIndex: 9999999
      }}
    >
      <Heading as="h3" sx={{ color: "black", width: "100%", display: "flex", justifyContent: "space-between", mb: 2, mr: 2 }}>
        {bannerHeading}
        <span style={{ marginLeft: "auto", cursor: "pointer" }} onClick={onClick} id="close-window">
          <Icon name="window-close" size={"1x"} color="white" />
        </span>
      </Heading>
      <Heading as="h4" sx={{ mb: 2, color: "black" }}>
        {children}
        {/* <Text sx={{ fontWeight: "bold" }}>Safety Check:</Text> Always verify you're on{" "}
        <Text sx={{ fontWeight: "bold" }}>app.kumo.earth</Text>! */}
      </Heading>
      <Progress max={visibility} value={changeInProgress} sx={{ color: "#da357a", mb: 1 }} />
    </Alert>
  ) : null;
};
