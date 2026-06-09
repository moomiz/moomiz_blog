"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { MermaidDiagram } from "@/components/mdx/MermaidDiagram";

type MdxPreProps = {
  children?: ReactNode;
  className?: string;
};

function getCodeText(children: ReactNode) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((child) => (typeof child === "string" ? child : "")).join("");
  }
  return "";
}

export function MdxPre({ children, className, ...props }: MdxPreProps) {
  const child = Children.only(children);

  if (
    isValidElement(child) &&
    typeof child.props === "object" &&
    child.props !== null &&
    "className" in child.props &&
    typeof child.props.className === "string" &&
    child.props.className.includes("language-mermaid")
  ) {
    const chart = getCodeText(
      "children" in child.props ? (child.props.children as ReactNode) : ""
    );
    return <MermaidDiagram chart={chart} />;
  }

  return (
    <pre className={className} {...props}>
      {children}
    </pre>
  );
}
