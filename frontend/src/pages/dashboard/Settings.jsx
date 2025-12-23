import React from "react";
import DashboardLayout from "../../components/interactive/DashboardLayout";
import {
    User,
    Lock,
    Bell,
    ShieldAlert,
    Camera,
    Mail,
    Save
} from "lucide-react";

export default function Settings() {
    const firstName = "Sricharan";
    const lastName = "Illandula";
    const fullName = `${firstName} ${lastName}`;
    const firstLetter = fullName.charAt(0).toUpperCase();
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 pb-10">

                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground">Manage your profile details and security preferences.</p>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" /> Security & Login
                        </h2>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                sricharan@example.com
                                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                            </div>
                        </div>

                        <div className="h-px bg-border"></div>

                        <div>
                            <h3 className="text-sm font-semibold mb-4">Change Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="password" placeholder="Current Password" className="p-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                                <div className="hidden md:block"></div> {/* Spacer */}
                                <input type="password" placeholder="New Password" className="p-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                                <input type="password" placeholder="Confirm New Password" className="p-2.5 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary" />
                            </div>
                            <button className="mt-4 text-sm text-primary hover:underline font-medium">Forgot Password?</button>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition">
                            <Save className="h-4 w-4" /> Save Changes
                        </button>
                    </div>
                </div>

                <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl overflow-hidden">
                    <div className="p-6 flex items-start justify-between">
                        <div>
                            <h2 className="font-semibold text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" /> Danger Zone
                            </h2>
                            <p className="text-sm text-red-600/80 mt-1">
                                Permanently delete your account and all of your content.
                            </p>
                        </div>
                        <button className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition">
                            Delete Account
                        </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}