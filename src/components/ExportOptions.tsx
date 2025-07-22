import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ExportOptionsProps {
  onExport?: (options: ExportSettings) => void;
  isProcessing?: boolean;
}

interface ExportSettings {
  template: string;
  includeCategories: boolean;
  includeSummary: boolean;
  fileFormat: string;
}

const ExportOptions = ({
  onExport = () => {},
  isProcessing = false,
}: ExportOptionsProps) => {
  const [settings, setSettings] = useState<ExportSettings>({
    template: "standard",
    includeCategories: true,
    includeSummary: true,
    fileFormat: "xlsx",
  });

  const handleSettingChange = (key: keyof ExportSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExport = () => {
    onExport(settings);
  };

  return (
    <Card className="w-full max-w-[600px] bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Export Options
        </CardTitle>
        <CardDescription>
          Customize your Excel export format and download your financial data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 border rounded-md cursor-pointer ${settings.template === "standard" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => handleSettingChange("template", "standard")}
              >
                <h3 className="font-medium">Standard</h3>
                <p className="text-sm text-muted-foreground">
                  Basic transaction list with dates, descriptions and amounts
                </p>
              </div>
              <div
                className={`p-4 border rounded-md cursor-pointer ${settings.template === "financial" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => handleSettingChange("template", "financial")}
              >
                <h3 className="font-medium">Financial Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Includes income/expense categories and monthly summaries
                </p>
              </div>
              <div
                className={`p-4 border rounded-md cursor-pointer ${settings.template === "accounting" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => handleSettingChange("template", "accounting")}
              >
                <h3 className="font-medium">Accounting</h3>
                <p className="text-sm text-muted-foreground">
                  Formatted for import into accounting software
                </p>
              </div>
              <div
                className={`p-4 border rounded-md cursor-pointer ${settings.template === "tax" ? "border-primary bg-primary/5" : "border-border"}`}
                onClick={() => handleSettingChange("template", "tax")}
              >
                <h3 className="font-medium">Tax Preparation</h3>
                <p className="text-sm text-muted-foreground">
                  Optimized for tax filing with relevant categories
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include-categories">Include Categories</Label>
                  <p className="text-sm text-muted-foreground">
                    Add transaction categories to the export
                  </p>
                </div>
                <Switch
                  id="include-categories"
                  checked={settings.includeCategories}
                  onCheckedChange={(checked) =>
                    handleSettingChange("includeCategories", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="include-summary">Include Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Add financial summary charts and totals
                  </p>
                </div>
                <Switch
                  id="include-summary"
                  checked={settings.includeSummary}
                  onCheckedChange={(checked) =>
                    handleSettingChange("includeSummary", checked)
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="file-format">File Format</Label>
                <Select
                  value={settings.fileFormat}
                  onValueChange={(value) =>
                    handleSettingChange("fileFormat", value)
                  }
                >
                  <SelectTrigger id="file-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV (.csv)</SelectItem>
                    <SelectItem value="xls">Excel 97-2003 (.xls)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Preview
        </Button>
        <Button
          onClick={handleExport}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isProcessing ? "Generating..." : "Download Excel"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExportOptions;
