import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileText, Code, Server, Globe, BarChart, AlertTriangle, FileBarChart } from "lucide-react";
import SpeedOverview from "./components/SpeedOverview";
import RealUsers from "./components/RealUsers";
import PagePerformance from "./components/PagePerformance";
import MicroLevel from "./components/MicroLevel";
import ApiSpeed from "./components/ApiSpeed";
import LocationNetwork from "./components/LocationNetwork";
import Benchmarks from "./components/Benchmarks";
import AlertsIncidents from "./components/AlertsIncidents";
import SpeedReports from "./components/SpeedReports";

const SpeedMonitoring = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Speed Monitoring</h1>
                <p className="text-muted-foreground">
                    Enterprise-level RUM and Performance Analysis.
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <div className="overflow-x-auto pb-2">
                    <TabsList className="h-auto w-max md:w-full flex-wrap justify-start md:justify-center">
                        <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" /> Overview</TabsTrigger>
                        <TabsTrigger value="rum" className="gap-2"><Users className="h-4 w-4" /> RUM</TabsTrigger>
                        <TabsTrigger value="pages" className="gap-2"><FileText className="h-4 w-4" /> Pages</TabsTrigger>
                        <TabsTrigger value="micro" className="gap-2"><Code className="h-4 w-4" /> Micro</TabsTrigger>
                        <TabsTrigger value="api" className="gap-2"><Server className="h-4 w-4" /> API</TabsTrigger>
                        <TabsTrigger value="network" className="gap-2"><Globe className="h-4 w-4" /> Network</TabsTrigger>
                        <TabsTrigger value="benchmark" className="gap-2"><BarChart className="h-4 w-4" /> Compare</TabsTrigger>
                        <TabsTrigger value="alerts" className="gap-2"><AlertTriangle className="h-4 w-4" /> Alerts</TabsTrigger>
                        <TabsTrigger value="reports" className="gap-2"><FileBarChart className="h-4 w-4" /> Reports</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                    <SpeedOverview />
                </TabsContent>

                <TabsContent value="rum" className="space-y-4">
                    <RealUsers />
                </TabsContent>

                <TabsContent value="pages" className="space-y-4">
                    <PagePerformance />
                </TabsContent>

                <TabsContent value="micro" className="space-y-4">
                    <MicroLevel />
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                    <ApiSpeed />
                </TabsContent>

                <TabsContent value="network" className="space-y-4">
                    <LocationNetwork />
                </TabsContent>

                <TabsContent value="benchmark" className="space-y-4">
                    <Benchmarks />
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    <AlertsIncidents />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <SpeedReports />
                </TabsContent>

            </Tabs>
        </div>
    );
};

export default SpeedMonitoring;
