"use client";

import { useState } from "react";
import { CloseLine } from "@/assets/icons";

const sizeChartTabs = [
  { id: "standard", label: "Standard" },
  { id: "blouse", label: "Blouse" },
  { id: "trouser", label: "Trouser" },
] as const;

const visibleSizeChartTabs = sizeChartTabs.filter((tab) => tab.id !== "standard");

type SizeChartTab = (typeof sizeChartTabs)[number]["id"];

export const sizeChartRows = [
  { size: "XS", chest: "31-33 in", waist: "24-26 in", hips: "34-36 in" },
  { size: "S", chest: "33-35 in", waist: "26-28 in", hips: "36-38 in" },
  { size: "M", chest: "35-37 in", waist: "28-30 in", hips: "38-40 in" },
  { size: "L", chest: "37-39 in", waist: "30-32 in", hips: "40-42 in" },
  { size: "XL", chest: "39-41 in", waist: "32-34 in", hips: "42-44 in" },
  { size: "XXL", chest: "41-43 in", waist: "34-36 in", hips: "44-46 in" },
];

type SizeChartModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SizeChartModal({ isOpen, onClose }: SizeChartModalProps) {
  const [activeTab, setActiveTab] = useState<SizeChartTab>("blouse");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-chart-title"
        className="relative max-h-full w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f1ec] text-[#111111] transition hover:bg-[#e9e3dc]"
          aria-label="Close size chart"
        >
          <CloseLine />
        </button>

        <div className="mb-5 pr-10">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#7a7a7a]">
            Fit guide
          </p>
          <h3 id="size-chart-title" className="mt-2 text-2xl font-semibold text-[#111111]">Size chart</h3>
        </div>

        <div role="tablist" aria-label="Size chart type" className="mb-5 flex overflow-x-auto border-b border-[#e5e1dc]">
          {visibleSizeChartTabs.map((tab) => (
            <button
              key={tab.id}
              id={`size-chart-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="size-chart-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#77736f] hover:text-[#111111]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          id="size-chart-panel"
          role="tabpanel"
          aria-labelledby={`size-chart-tab-${activeTab}`}
          className="min-h-40"
        >
          {activeTab === "standard" ? (
            <>
              <div className="overflow-hidden rounded-xl border border-[#e5e1dc]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-[#111111]">
                    <thead className="bg-[#f5f3f0] text-[0.7rem] uppercase tracking-[0.12em] text-[#5f5d5a]">
                      <tr>
                        <th className="px-4 py-3 font-medium">Size</th>
                        <th className="px-4 py-3 font-medium">Chest</th>
                        <th className="px-4 py-3 font-medium">Waist</th>
                        <th className="px-4 py-3 font-medium">Hips</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartRows.map((row) => (
                        <tr key={row.size} className="border-t border-[#e5e1dc]">
                          <td className="px-4 py-3 font-medium">{row.size}</td>
                          <td className="px-4 py-3">{row.chest}</td>
                          <td className="px-4 py-3">{row.waist}</td>
                          <td className="px-4 py-3">{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#4d4d4d]">
                Measurements are in inches and may vary by fabric and fit preference.
              </p>
            </>
          ) : (
            <img
              src={`/images/size-charts/${activeTab}-size-chart.png`}
              alt={`${activeTab === "blouse" ? "Blouse" : "Trouser"} size chart with measurements`}
              className="mx-auto h-auto w-full rounded-lg object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
