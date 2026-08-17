import React from 'react';
import { ConnectivityProvider } from './context/ConnectivityContext';
import { IncidentProvider } from './context/IncidentContext';
import { RoleProvider, useRole } from './context/RoleContext';
import { Navbar } from './components/Common/Navbar';
import { ControlRoomDashboard } from './components/ControlRoom/ControlRoomDashboard';
import { TouristMobileView } from './components/Tourist/TouristMobileView';
import { RescueTeamView } from './components/RescueTeam/RescueTeamView';
import { DemoScenarioController } from './components/Demo/DemoScenarioController';

const MainContent: React.FC = () => {
  const { activeRole } = useRole();

  return (
    <main className="min-h-[calc(100vh-140px)] pb-12">
      {activeRole === 'CONTROL_ROOM' && <ControlRoomDashboard />}
      {activeRole === 'TOURIST_PWA' && <TouristMobileView />}
      {activeRole === 'RESCUE_TEAM' && <RescueTeamView />}
      {activeRole === 'DEMO_GUIDE' && (
        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          <DemoScenarioController />
          <ControlRoomDashboard />
        </div>
      )}
    </main>
  );
};

export function App() {
  return (
    <ConnectivityProvider>
      <IncidentProvider>
        <RoleProvider>
          <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-orange-500 selection:text-zinc-950">
            <Navbar />
            <MainContent />
          </div>
        </RoleProvider>
      </IncidentProvider>
    </ConnectivityProvider>
  );
}

export default App;
