import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react";

interface Page {
  id: string;
  thumbnail: string;
  fullImage: string;
  tables: Table[];
}

interface Table {
  id: string;
  name: string;
  selected: boolean;
  preview: string;
}

interface DocumentPreviewProps {
  pages?: Page[];
  onRegionSelect?: (tableId: string, selected: boolean) => void;
  onPageChange?: (pageIndex: number) => void;
  onSettingsChange?: (settings: any) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  pages = [
    {
      id: "1",
      thumbnail:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&q=80",
      fullImage:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
      tables: [
        {
          id: "t1",
          name: "Transaction Table 1",
          selected: true,
          preview:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
        },
        {
          id: "t2",
          name: "Summary Table",
          selected: false,
          preview:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
        },
      ],
    },
    {
      id: "2",
      thumbnail:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&q=80",
      fullImage:
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80",
      tables: [
        {
          id: "t3",
          name: "Transaction Table 2",
          selected: true,
          preview:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
        },
      ],
    },
  ],
  onRegionSelect = () => {},
  onPageChange = () => {},
  onSettingsChange = () => {},
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const currentPage = pages[currentPageIndex];

  const handlePageChange = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
      onPageChange(index);
    }
  };

  const handleTableSelection = (tableId: string, checked: boolean) => {
    onRegionSelect(tableId, checked);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoom = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  return (
    <Card className="w-full bg-white border rounded-lg shadow-sm">
      <div className="flex flex-col h-[500px]">
        <div className="flex items-center justify-between border-b p-2">
          <h3 className="text-lg font-medium">Document Preview</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom([Math.max(50, zoomLevel - 10)])}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-32">
              <Slider
                value={[zoomLevel]}
                min={50}
                max={200}
                step={10}
                onValueChange={handleZoom}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom([Math.min(200, zoomLevel + 10)])}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Thumbnails sidebar */}
          <div className="w-24 border-r overflow-y-auto bg-muted/20">
            <ScrollArea className="h-full">
              <div className="p-2 space-y-2">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`cursor-pointer rounded border-2 ${currentPageIndex === index ? "border-primary" : "border-transparent"}`}
                    onClick={() => handlePageChange(index)}
                  >
                    <img
                      src={page.thumbnail}
                      alt={`Page ${index + 1}`}
                      className="w-full h-auto rounded"
                    />
                    <div className="text-center text-xs mt-1">
                      Page {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="border-b px-4">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="tables">Detected Tables</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 overflow-auto p-4">
                <div className="flex justify-center">
                  <div
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: "top center",
                      transition: "transform 0.2s",
                    }}
                  >
                    <img
                      src={currentPage.fullImage}
                      alt={`Page ${currentPageIndex + 1} full view`}
                      className="max-w-full h-auto border rounded shadow-sm"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tables" className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {currentPage.tables.map((table) => (
                    <Card key={table.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-4 border-b bg-muted/10 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`table-${table.id}`}
                              checked={table.selected}
                              onCheckedChange={(checked) =>
                                handleTableSelection(table.id, !!checked)
                              }
                            />
                            <Label htmlFor={`table-${table.id}`}>
                              {table.name}
                            </Label>
                          </div>
                        </div>
                        <div className="p-4">
                          <img
                            src={table.preview}
                            alt={table.name}
                            className="w-full h-auto border rounded"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex items-center justify-between border-t p-2">
          <div className="text-sm text-muted-foreground">
            Page {currentPageIndex + 1} of {pages.length}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPageIndex - 1)}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPageIndex + 1)}
              disabled={currentPageIndex === pages.length - 1}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentPreview;
