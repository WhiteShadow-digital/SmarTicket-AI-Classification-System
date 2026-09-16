import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Finances</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Financial management features, including detailed transaction logs, invoicing, and payment tracking, will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
