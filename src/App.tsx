import React, { useState, useRef } from "react";
import {
  Receipt,
  Upload,
  Loader2,
  Plus,
  Minus,
  DollarSign,
  Trash2,
  Edit2,
  Check,
  X,
  UserPlus,
  User,
  ShoppingCart,
} from "lucide-react";
import { createWorker } from "tesseract.js";
import Footer from "./Footer";

interface Item {
  name: string;
  price: number;
  splitBetween: string[];
}

interface Person {
  name: string;
  total: number;
}

interface EditingItem {
  index: number;
  name: string;
  price: number;
}

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [totals, setTotals] = useState<Person[]>([]);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([...people, newPersonName.trim()]);
      setNewPersonName("");
    }
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPerson();
    }
  };

  const completeSetup = () => {
    if (people.length >= 2) {
      setSetupComplete(true);
    } else {
      alert("Please add at least 2 people to split the bill.");
    }
  };

  const isNonItemLine = (line: string): boolean => {
    const nonItemKeywords = [
      // "subtotal",
      // "total",
      // 'tax',
      "gst",
      "hst",
      "pst",
      "balance",
      "change",
      "cash",
      "credit",
      "debit",
      "eft",
      "payment",
      "tip",
      "gratuity",
      "discount",
      "savings",
      "card",
      "visa",
      "mastercard",
      "amex",
      "american express",
      "order",
      "receipt",
      "terminal",
      "transaction",
      "approved",
      "auth",
      "reference",
      "merchant",
      "store",
      "location",
      "date",
      "time",
      "tel",
      "phone",
      "address",
      "#",
      "*",
    ];

    const lowercaseLine = line.toLowerCase();
    return nonItemKeywords.some((keyword) => lowercaseLine.includes(keyword));
  };

  const processReceipt = async (file: File) => {
    setIsProcessing(true);
    try {
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      const lines = text.split("\n");
      const newItems: Item[] = [];

      for (const line of lines) {
        if (line.trim().length < 3) continue;

        const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          let name = line.replace(priceMatch[0], "").trim();
          name = name.replace(/^[\d\W]+/, "").trim();

          if (isNonItemLine(line)) continue;
          // if (price > 500) continue;
          // if (name.length < 2 || /^\d+$/.test(name)) continue;
          // if (/^\d+\s*@/.test(name)) continue;

          newItems.push({
            name,
            price,
            splitBetween: [],
          });
        }
      }

      setItems(newItems);
    } catch (error) {
      console.error("Error processing receipt:", error);
      alert("Error processing receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processReceipt(file);
    }
  };

  const handleManually = () => {
    const newItems: Item[] = [];
    newItems.push({
      name: "Enter Item Name",
      price: 0,
      splitBetween: [],
    });
    setItems(newItems);
  };

  const togglePerson = (itemIndex: number, person: string) => {
    const newItems = [...items];
    const item = newItems[itemIndex];

    if (item.splitBetween.includes(person)) {
      item.splitBetween = item.splitBetween.filter((p) => p !== person);
    } else {
      item.splitBetween.push(person);
    }

    setItems(newItems);
    calculateTotals(newItems);
  };

  const calculateTotals = (currentItems: Item[]) => {
    const newTotals: Person[] = people.map((person) => ({
      name: person,
      total: 0,
    }));

    currentItems.forEach((item) => {
      if (item.splitBetween.length > 0) {
        const splitAmount = item.price / item.splitBetween.length;
        item.splitBetween.forEach((person) => {
          const personTotal = newTotals.find((p) => p.name === person);
          if (personTotal) {
            personTotal.total += splitAmount;
          }
        });
      }
    });

    setTotals(newTotals);
  };

  const calculateTotalAmount = () => {
    return items.reduce((acc, curr) => curr.price + acc, 0);
  };

  const addItem = () => {
    const newItems = [...items];
    newItems.push({
      name: "Enter Item Name",
      price: 0,
      splitBetween: [],
    });
    setItems(newItems);
  };

  const deleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotals(newItems);
  };

  const startEditing = (index: number) => {
    setEditingItem({
      index,
      name: items[index].name,
      price: items[index].price,
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const saveEditing = () => {
    if (editingItem) {
      const newItems = [...items];
      newItems[editingItem.index] = {
        ...newItems[editingItem.index],
        name: editingItem.name,
        price: editingItem.price,
      };
      setItems(newItems);
      calculateTotals(newItems);
      setEditingItem(null);
    }
  };

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">
                Who's Splitting?
              </h1>
            </div>
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addPerson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <UserPlus className="w-5 h-5 mr-1" />
                  Add
                </button>
              </div>
              {people.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    People ({people.length})
                  </h2>
                  {people.map((person, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                    >
                      <span className="font-medium">{person}</span>
                      <button
                        onClick={() => removePerson(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={completeSetup}
                disabled={people.length < 2}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  people.length < 2
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Start Splitting
              </button>
              {people.length < 2 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Add at least 2 people to continue
                </p>
              )}
            </div>
          </div>
        </div>
        {<Footer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            <Receipt className="w-8 h-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">SplitMate</h1>
          </div>
          {items.length < 1 && (
            <>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" /> Upload a Receipt
                    </>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="flex items-center justify-center my-2">or</h3>
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-500"
                  onClick={handleManually}
                >
                  Add Items Manually
                </button>
              </div>
            </>
          )}
          {items.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Receipt Items
              </h2>
              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  {editingItem?.index === index ? (
                    <div className="flex items-center gap-4 mb-2">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            name: e.target.value,
                          })
                        }
                        className="flex-1 px-2 py-1 border rounded"
                      />
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4" />
                        <input
                          type="number"
                          value={editingItem.price}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          step="0.01"
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </div>
                      <button
                        onClick={saveEditing}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4 inline" />
                          {item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => startEditing(index)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteItem(index)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {people.map((person) => (
                      <button
                        key={person}
                        onClick={() => togglePerson(index, person)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.splitBetween.includes(person)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {person}
                        {item.splitBetween.includes(person) ? (
                          <Minus className="w-4 h-4 inline ml-1" />
                        ) : (
                          <Plus className="w-4 h-4 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <ShoppingCart className="w-5 h-5 mr-1" />
                  Add New Item
                </button>
              </div>
              {totals.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Final Split
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {totals.map((person) => (
                      <div
                        key={person.name}
                        className="bg-blue-50 p-4 rounded-md"
                      >
                        <div className="text-lg font-medium text-blue-900">
                          {person.name}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${person.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 border-t pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-2xl font-bold text-blue-600">
                        Total
                      </div>
                      <div className="text-lg font-medium text-blue-900">
                        ${calculateTotalAmount().toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
