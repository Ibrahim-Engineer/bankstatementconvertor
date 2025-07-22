import React, { useState } from "react";
import { motion } from "framer-motion";
import FileUploader from "./FileUploader";
import DocumentPreview from "./DocumentPreview";
import TransactionCategorizer from "./TransactionCategorizer";
import ExportOptions from "./ExportOptions";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowRight, FileText, BarChart3, Download } from "lucide-react";

const Home = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [categorizedData, setCategorizedData] = useState<any>(null);

  const steps = [
    {
      id: "upload",
      title: "Upload PDF",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "preview",
      title: "Preview Data",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      id: "categorize",
      title: "Categorize",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    { id: "export", title: "Export", icon: <Download className="h-5 w-5" /> },
  ];

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep(1);
  };

  const handlePreviewComplete = (data: any) => {
    setPreviewData(data);
    setCurrentStep(2);
  };

  const handleCategorizationComplete = (data: any) => {
    setCategorizedData(data);
    setCurrentStep(3);
  };

  const handleExportComplete = () => {
    // In a real app, this would trigger the download
    alert("Excel file generated and downloaded!");
    // Optionally reset the process
    // setCurrentStep(0);
    // setUploadedFile(null);
    // setPreviewData(null);
    // setCategorizedData(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <FileUploader onFileUpload={handleFileUpload} />;
      case 1:
        return (
          <DocumentPreview
            file={uploadedFile}
            previewData={previewData}
            onComplete={handlePreviewComplete}
          />
        );
      case 2:
        return (
          <TransactionCategorizer
            data={previewData}
            onComplete={handleCategorizationComplete}
          />
        );
      case 3:
        return (
          <ExportOptions
            onExport={handleExportComplete}
            data={categorizedData}
          />
        );
      default:
        return <FileUploader onFileUpload={handleFileUpload} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              PDF Bank Statement Converter
            </h1>
          </div>
          <div>
            <Button variant="outline" className="mr-2">
              Sign In
            </Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4">
        {/* Hero Section (only visible on first step) */}
        {currentStep === 0 && (
          <div className="mb-12 text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Convert Bank Statement PDFs to Excel in Seconds
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Upload your bank statement PDF and get a perfectly organized Excel
              spreadsheet with categorized transactions.
            </motion.p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center max-w-3xl w-full">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
                    >
                      {step.icon}
                    </div>
                    <span className="text-sm mt-2">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${index < currentStep ? "bg-primary" : "bg-gray-200"}`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-5xl mx-auto bg-white">
          <CardContent className="p-6">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between max-w-5xl mx-auto mt-6">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Back
            </Button>
          )}
          <div></div> {/* Spacer */}
          {currentStep < steps.length - 1 && currentStep > 0 && (
            <Button
              onClick={() => {
                if (currentStep === 1) handlePreviewComplete(previewData);
                else if (currentStep === 2)
                  handleCategorizationComplete(categorizedData);
                else setCurrentStep(currentStep + 1);
              }}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 px-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2023 PDF Bank Statement Converter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
