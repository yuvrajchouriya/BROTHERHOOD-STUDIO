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
import InteractionPerformance from "./components/InteractionPerformance";
import RootCauseInsights from "./components/RootCauseInsights";
import {
    Activity,
    Users,
    Zap,
    Cpu,
    Server,
    Globe,
    LineChart,
    AlertOctagon,
    FileText,
    MousePointerClick,
    Lightbulb
} from "lucide-react";

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
                        <TabsTrigger value="interactions" className="gap-2"><MousePointerClick className="h-4 w-4" /> Interactions</TabsTrigger>
                        <TabsTrigger value="insights" className="gap-2"><Lightbulb className="h-4 w-4" /> AI Insights</TabsTrigger>
                        <TabsTrigger value="rum" className="gap-2"><Users className="h-4 w-4" /> Real Users</TabsTrigger>
                        <TabsTrigger value="pages" className="gap-2"><Zap className="h-4 w-4" /> Pages</TabsTrigger>
                        <TabsTrigger value="micro" className="gap-2"><Cpu className="h-4 w-4" /> Micro (Resources)</TabsTrigger>
                        <TabsTrigger value="api" className="gap-2"><Server className="h-4 w-4" /> API</TabsTrigger>
                        <TabsTrigger value="network" className="gap-2"><Globe className="h-4 w-4" /> Network</TabsTrigger>
                        <TabsTrigger value="benchmarks" className="gap-2"><LineChart className="h-4 w-4" /> Compare</TabsTrigger>
                        <TabsTrigger value="alerts" className="gap-2"><AlertOctagon className="h-4 w-4" /> Alerts</TabsTrigger>
                        <TabsTrigger value="reports" className="gap-2"><FileText className="h-4 w-4" /> Reports</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                    <SpeedOverview />
                </TabsContent>
                <TabsContent value="interactions" className="space-y-4">
                    <InteractionPerformance />
                </TabsContent>
                <TabsContent value="insights" className="space-y-4">
                    <RootCauseInsights />
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
