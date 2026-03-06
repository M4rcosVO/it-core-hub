import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivacyProvider } from "@/components/PrivacyContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuditProvider } from "@/components/AuditContext";
import { AuthProvider } from "@/components/AuthContext";
import { DataProvider } from "@/components/DataContext";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <ThemeProvider>
                    <AuthProvider>
                        <PrivacyProvider>
                            <AuditProvider>
                                <DataProvider>
                                    {children}
                                </DataProvider>
                            </AuditProvider>
                        </PrivacyProvider>
                    </AuthProvider>
                </ThemeProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
};
