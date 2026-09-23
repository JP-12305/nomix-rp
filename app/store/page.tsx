"use client";

import React from "react";
import PackagesSection from "@/components/packages/PackagesSection";

export default function StorePage() {
  return (
    <div className="pt-32 pb-24">
      <PackagesSection showTitle={true} />
    </div>
  );
}

