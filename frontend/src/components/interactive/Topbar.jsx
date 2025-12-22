import { Sun, Moon, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const profileLetter = user?.email?.charAt(0)?.toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-card border-b border-border 
                      flex items-center justify-between px-6 z-30">

      <div className="font-semibold text-lg">
        Welcome, <span className="text-primary">{user?.fullName}</span>
      </div>

      <div className="flex items-center gap-4">

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-3">

          {/* <div className="text-sm text-muted-foreground">
            {user?.email}
          </div> */}

          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="profile"
              className="h-10 w-10 rounded-full border object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/20 text-primary 
                            flex items-center justify-center font-semibold text-lg">
              {profileLetter}
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive 
                     rounded-lg hover:bg-destructive hover:text-white transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

      </div>
    </header>
  );
}
