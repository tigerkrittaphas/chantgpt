import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ChantProvider } from "./context/ChantContext";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import PersonalInfo from "./pages/PersonalInfo";
import Wishes from "./pages/Wishes";
import Loading from "./pages/Loading";
import Result from "./pages/Result";
import Donate from "./pages/Donate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <ChantProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/personal-info" element={<PersonalInfo />} />
              <Route path="/wishes" element={<Wishes />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/result" element={<Result />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ChantProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
