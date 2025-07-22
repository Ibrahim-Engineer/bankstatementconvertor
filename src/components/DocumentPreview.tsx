import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  AlertCircle,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url,
).toString();

interface Transaction {
  date: string;
  description: string;
  amount: number;
  balance?: number;
}

interface Page {
  id: string;
  pageNumber: number;
  text: string;
  transactions: Transaction[];
  thumbnail: string;
  fullImage: string;
  tables: Table[];
  canvas?: HTMLCanvasElement;
}

interface Table {
  id: string;
  name: string;
  selected: boolean;
  preview: string;
  transactions: Transaction[];
}

interface DocumentPreviewProps {
  file?: File | null;
  pages?: Page[];
  onRegionSelect?: (tableId: string, selected: boolean) => void;
  onPageChange?: (pageIndex: number) => void;
  onSettingsChange?: (settings: any) => void;
  onComplete?: (data: any) => void;
  previewData?: any;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  file = null,
  pages: initialPages = [],
  onRegionSelect = () => {},
  onPageChange = () => {},
  onSettingsChange = () => {},
  onComplete = () => {},
  previewData = null,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPage = pages[currentPageIndex];

  // Extract transactions from text using regex patterns
  const extractTransactions = (text: string): Transaction[] => {
    const transactions: Transaction[] = [];
    const lines = text.split("\n");

    // Common bank statement patterns
    const datePattern =
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
    const amountPattern = /([+-]?\$?[\d,]+\.\d{2})/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        const amounts = line.match(amountPattern);
        if (amounts && amounts.length > 0) {
          // Extract description (text between date and first amount)
          const dateIndex = line.indexOf(dateMatch[0]);
          const firstAmountIndex = line.indexOf(amounts[0]);

          if (firstAmountIndex > dateIndex) {
            const description = line
              .substring(dateIndex + dateMatch[0].length, firstAmountIndex)
              .trim();
            const amount = parseFloat(amounts[0].replace(/[\$,]/g, ""));
            const balance =
              amounts.length > 1
                ? parseFloat(amounts[amounts.length - 1].replace(/[\$,]/g, ""))
                : undefined;

            if (description && !isNaN(amount)) {
              transactions.push({
                date: dateMatch[0],
                description: description,
                amount: amount,
                balance: balance,
              });
            }
          }
        }
      }
    }

    return transactions;
  };

  // Render PDF page to canvas
  const renderPDFPage = async (
    pdf: any,
    pageNumber: number,
    scale: number = 1.5,
  ): Promise<{ canvas: HTMLCanvasElement; thumbnail: string }> => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Create thumbnail
    const thumbnailCanvas = document.createElement("canvas");
    const thumbnailContext = thumbnailCanvas.getContext("2d");
    const thumbnailScale = 150 / Math.max(viewport.width, viewport.height);
    thumbnailCanvas.width = viewport.width * thumbnailScale;
    thumbnailCanvas.height = viewport.height * thumbnailScale;

    thumbnailContext?.drawImage(
      canvas,
      0,
      0,
      thumbnailCanvas.width,
      thumbnailCanvas.height,
    );

    return {
      canvas,
      thumbnail: thumbnailCanvas.toDataURL(),
    };
  };

  // PDF parsing function
  const parsePDF = async (file: File): Promise<Page[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pages: Page[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");

        // Render page to canvas
        const { canvas, thumbnail } = await renderPDFPage(pdf, pageNum);

        // Extract transactions from text
        const transactions = extractTransactions(text);

        // Create tables based on detected transactions
        const tables: Table[] = [];
        if (transactions.length > 0) {
          tables.push({
            id: `t${pageNum}`,
            name: `Transaction Table ${pageNum}`,
            selected: true,
            preview: thumbnail,
            transactions: transactions,
          });
        }

        pages.push({
          id: pageNum.toString(),
          pageNumber: pageNum,
          text: text,
          transactions: transactions,
          thumbnail: thumbnail,
          fullImage: canvas.toDataURL(),
          tables: tables,
          canvas: canvas,
        });
      }

      return pages;
    } catch (err) {
      throw new Error("Failed to parse PDF: " + (err as Error).message);
    }
  };

  // Process uploaded file
  useEffect(() => {
    if (file && initialPages.length === 0) {
      setIsProcessing(true);
      setError(null);

      parsePDF(file)
        .then((parsedPages) => {
          setPages(parsedPages);

          // Extract all transactions from all pages
          const allTransactions = parsedPages.flatMap(
            (page) => page.transactions,
          );
          setExtractedData({
            pages: parsedPages.length,
            totalTransactions: allTransactions.length,
            transactions: allTransactions,
            dateRange: {
              start: allTransactions[0]?.date || "",
              end: allTransactions[allTransactions.length - 1]?.date || "",
            },
          });

          setIsProcessing(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsProcessing(false);
        });
    }
  }, [file, initialPages.length]);

  const handlePageChange = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index);
      onPageChange(index);
    }
  };

  const handleTableSelection = (tableId: string, checked: boolean) => {
    // Update the table selection state
    setPages((prevPages) =>
      prevPages.map((page) => ({
        ...page,
        tables: page.tables.map((table) =>
          table.id === tableId ? { ...table, selected: checked } : table,
        ),
      })),
    );
    onRegionSelect(tableId, checked);
  };

  const handleContinue = () => {
    if (extractedData) {
      // Get selected tables and their transactions
      const selectedTables = pages.flatMap((page) =>
        page.tables.filter((table) => table.selected),
      );
      const selectedTransactions = selectedTables.flatMap(
        (table) => table.transactions,
      );

      onComplete({
        ...extractedData,
        selectedTransactions,
        selectedTables: selectedTables.length,
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoom = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  if (isProcessing) {
    return (
      <Card className="w-full bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center h-[500px] p-8">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Processing PDF...
          </h3>
          <p className="text-sm text-gray-500 text-center">
            Extracting transactions and analyzing document structure
          </p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center h-[500px] p-8">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Processing Error
          </h3>
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card className="w-full bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center h-[500px] p-8">
          <p className="text-gray-500">No document to preview</p>
        </div>
      </Card>
    );
  }

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
                    {currentPage.canvas ? (
                      <canvas
                        ref={canvasRef}
                        width={currentPage.canvas.width}
                        height={currentPage.canvas.height}
                        className="max-w-full h-auto border rounded shadow-sm"
                        style={{
                          backgroundImage: `url(${currentPage.fullImage})`,
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center",
                        }}
                      />
                    ) : (
                      <img
                        src={currentPage.fullImage}
                        alt={`Page ${currentPageIndex + 1} full view`}
                        className="max-w-full h-auto border rounded shadow-sm"
                      />
                    )}
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
                              {table.name} ({table.transactions.length}{" "}
                              transactions)
                            </Label>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {table.transactions
                              .slice(0, 3)
                              .map((transaction, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center text-sm border-b pb-1"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {transaction.description}
                                    </div>
                                    <div className="text-gray-500">
                                      {transaction.date}
                                    </div>
                                  </div>
                                  <div
                                    className={`font-medium ${
                                      transaction.amount >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {transaction.amount.toLocaleString(
                                      "en-US",
                                      {
                                        style: "currency",
                                        currency: "USD",
                                      },
                                    )}
                                  </div>
                                </div>
                              ))}
                            {table.transactions.length > 3 && (
                              <div className="text-sm text-gray-500 text-center pt-2">
                                +{table.transactions.length - 3} more
                                transactions
                              </div>
                            )}
                          </div>
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
            {extractedData && (
              <span className="ml-4">
                {extractedData.totalTransactions} transactions found
              </span>
            )}
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
            {extractedData && (
              <Button onClick={handleContinue} className="ml-4">
                Continue to Categorization
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DocumentPreview;
