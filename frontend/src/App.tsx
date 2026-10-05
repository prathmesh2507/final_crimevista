import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";
import { Layout } from "./components/layout/Layout";
import { FilterProvider } from "./contexts/FilterContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AreaExplorer } from "./pages/AreaExplorer";
import { CrimeMap } from "./pages/CrimeMap";
import { Dashboard } from "./pages/Dashboard";
import { DataUpload } from "./pages/DataUpload";
import { Help } from "./pages/Help";
import { Hotspots } from "./pages/Hotspots";
import { Landing } from "./pages/Landing";
import { NotFound } from "./pages/NotFound";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Trends } from "./pages/Trends";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <FilterProvider>
          <BrowserRouter>
            <Routes>
              <Route index element={<Landing />} />
              <Route element={<Layout />}>
                <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/crime-map" element={<Navigate to="/map" replace />} />
                <Route path="/map" element={<CrimeMap />} />
                <Route path="/hotspots" element={<Hotspots />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/area-explorer" element={<Navigate to="/areas" replace />} />
                <Route path="/areas" element={<AreaExplorer />} />
                <Route path="/data-upload" element={<Navigate to="/upload" replace />} />
                <Route path="/upload" element={<DataUpload />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/help" element={<Help />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FilterProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
