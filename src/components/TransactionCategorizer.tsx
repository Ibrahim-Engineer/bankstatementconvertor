import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ArrowUpDown, Save } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

interface TransactionCategorizerProps {
  transactions?: Transaction[];
  onCategoriesChange?: (transactions: Transaction[]) => void;
}

const categories = [
  "Salary",
  "Groceries",
  "Rent",
  "Utilities",
  "Transportation",
  "Entertainment",
  "Dining",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

const TransactionCategorizer: React.FC<TransactionCategorizerProps> = ({
  transactions: initialTransactions = [],
  onCategoriesChange = () => {},
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions.length > 0
      ? initialTransactions
      : [
          {
            id: "1",
            date: "2023-05-01",
            description: "Payroll Deposit",
            amount: 3500,
            category: "Salary",
            type: "income",
          },
          {
            id: "2",
            date: "2023-05-02",
            description: "Supermarket",
            amount: -120.45,
            category: "Groceries",
            type: "expense",
          },
          {
            id: "3",
            date: "2023-05-03",
            description: "Monthly Rent",
            amount: -1200,
            category: "Rent",
            type: "expense",
          },
          {
            id: "4",
            date: "2023-05-05",
            description: "Electric Bill",
            amount: -85.2,
            category: "Utilities",
            type: "expense",
          },
          {
            id: "5",
            date: "2023-05-08",
            description: "Gas Station",
            amount: -45.75,
            category: "Transportation",
            type: "expense",
          },
          {
            id: "6",
            date: "2023-05-10",
            description: "Movie Theater",
            amount: -32.5,
            category: "Entertainment",
            type: "expense",
          },
          {
            id: "7",
            date: "2023-05-15",
            description: "Bonus Payment",
            amount: 500,
            category: "Salary",
            type: "income",
          },
          {
            id: "8",
            date: "2023-05-18",
            description: "Restaurant Dinner",
            amount: -78.9,
            category: "Dining",
            type: "expense",
          },
        ],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transaction;
    direction: "asc" | "desc";
  } | null>(null);

  // Handle category change for a transaction
  const handleCategoryChange = (id: string, newCategory: string) => {
    const updatedTransactions = transactions.map((transaction) => {
      if (transaction.id === id) {
        return { ...transaction, category: newCategory };
      }
      return transaction;
    });

    setTransactions(updatedTransactions);
    onCategoriesChange(updatedTransactions);
  };

  // Filter transactions based on search term and filter type
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === "all") return matchesSearch;
    return matchesSearch && transaction.type === filterType;
  });

  // Sort transactions
  const sortedTransactions = React.useMemo(() => {
    let sortableTransactions = [...filteredTransactions];
    if (sortConfig !== null) {
      sortableTransactions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTransactions;
  }, [filteredTransactions, sortConfig]);

  // Request sort
  const requestSort = (key: keyof Transaction) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Calculate summary
  const summary = React.useMemo(() => {
    const result = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      categorySummary: {} as Record<string, number>,
    };

    transactions.forEach((transaction) => {
      if (transaction.amount > 0) {
        result.totalIncome += transaction.amount;
      } else {
        result.totalExpense += Math.abs(transaction.amount);
      }

      // Track spending by category
      if (!result.categorySummary[transaction.category]) {
        result.categorySummary[transaction.category] = 0;
      }
      result.categorySummary[transaction.category] += transaction.amount;
    });

    result.balance = result.totalIncome - result.totalExpense;
    return result;
  }, [transactions]);

  return (
    <div className="bg-background w-full p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Transaction Categorizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="income">Income Only</SelectItem>
                  <SelectItem value="expense">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="w-[100px] cursor-pointer"
                    onClick={() => requestSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("description")}
                  >
                    <div className="flex items-center">
                      Description
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => requestSort("amount")}
                  >
                    <div className="flex items-center">
                      Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell
                        className={
                          transaction.amount >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.amount.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={transaction.category}
                          onValueChange={(value) =>
                            handleCategoryChange(transaction.id, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.totalIncome.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.totalExpense.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Balance
                  </p>
                  <p
                    className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {summary.balance.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Category Summary</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.categorySummary).map(
                ([category, amount]) => (
                  <Badge
                    key={category}
                    variant={amount >= 0 ? "secondary" : "outline"}
                    className={`text-sm py-1 ${amount >= 0 ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {category}:{" "}
                    {amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </Badge>
                ),
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Categories
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionCategorizer;
