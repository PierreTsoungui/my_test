
import { useState } from "react";
import { HighestSecurityRisks } from "../components/dashboard/HighestSecurityRisks";
import { UpcomingEolCard } from "../components/dashboard/UpcomingEolCard";
import { securityRisksDemoData } from "../data/securityRisksDemoData";
import { upcomingEolDemoData } from "../data/upcomingEolDemoData";

const PAGE_SIZE = 6;
const EOL_PAGE_SIZE = 6;

export function OverviewPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [eolPage, setEolPage] = useState(1);

  // Sicherheitsrisiken
  const totalItems = securityRisksDemoData.length;

  const risks = securityRisksDemoData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Bevorstehendes Support-Ende (EOL)
  const eolTotalItems = upcomingEolDemoData.length;

  const eolItems = upcomingEolDemoData.slice(
    (eolPage - 1) * EOL_PAGE_SIZE,
    eolPage * EOL_PAGE_SIZE,
  );

  function handleViewDetails(
    risk: (typeof securityRisksDemoData)[number],
  ) {
    console.log("Sicherheitsrisiko:", risk);
  }

  function handleEolViewDetails(
    item: (typeof upcomingEolDemoData)[number],
  ) {
    console.log("EOL-Details:", item);
  }

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <HighestSecurityRisks
        risks={risks}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onViewDetails={handleViewDetails}
      />

      <UpcomingEolCard
        items={eolItems}
        totalItems={eolTotalItems}
        currentPage={eolPage}
        pageSize={EOL_PAGE_SIZE}
        onPageChange={setEolPage}
        onViewDetails={handleEolViewDetails}
      />
    </main>
  );
}
