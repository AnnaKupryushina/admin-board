import DashboardHeader from "../components/DashboardHeader";
import DashboardWidgets from "../components/DashboardWidgets";
import ClientsPanel from "../components/ClientsPanel";
import RequestsPanel from "../components/RequestsPanel";

export default function Dashboard() {
  return (
    <div className="page dashboard-page">
      <DashboardHeader />
      <main>
        <DashboardWidgets />
        <ClientsPanel />
        <RequestsPanel />
      </main>
    </div>
  );
}
