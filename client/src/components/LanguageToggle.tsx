import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-background shadow-md hover:shadow-lg transition-shadow"
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language.toggle")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("pl")}>
          <span className="mr-2 font-semibold px-1 bg-red-100 dark:bg-red-900 rounded text-red-800 dark:text-red-200">PL</span>
          <span>{t("language.polish")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("en")}>
          <span className="mr-2 font-semibold px-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">EN</span>
          <span>{t("language.english")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}