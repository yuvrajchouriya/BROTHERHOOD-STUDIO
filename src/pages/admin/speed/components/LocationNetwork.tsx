import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LocationNetwork = () => {
    const cityData = [
        { city: 'Delhi', loadTime: 2.4 },
        { city: 'Mumbai', loadTime: 2.1 },
        { city: 'Bangalore', loadTime: 1.9 },
        { city: 'Patna', loadTime: 3.9 },
        { city: 'Raipur', loadTime: 3.1 },
    ];

    const networkData = [
        { type: '4G', speed: 2.8 },
        { type: '5G', speed: 1.6 },
        { type: 'WiFi', speed: 1.2 },
        { type: '3G', speed: 4.5 },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>City-wise Latency</CardTitle>
                    <CardDescription>Avg Load Time (s) by Location</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cityData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="city" type="category" width={80} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="loadTime" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Network Performance</CardTitle>
                    <CardDescription>Avg Load Time (s) by Connection Type</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={networkData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="type" tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="speed" fill="#82ca9d" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default LocationNetwork;
