import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubjectsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Subjects</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Subject and curriculum management features, such as adding courses and assigning teachers, will be available here.</p>
      </CardContent>
    </Card>
  );
}
