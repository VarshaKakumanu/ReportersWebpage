import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Icons } from "@/components/icons";
import { Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mainMenu } from "@/config/menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDispatch, useSelector } from "react-redux";
import React from "react"
import { loggedIn } from "@/Redux/reducers/login";

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userDetails = useSelector((state: any) => state?.userDetails);

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur">
      <div className="container px-4 md:px-8 flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavLink to="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="w-8 h-8" /> <p className="font-bold text-base ">ETV Bharat</p>
          </NavLink>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {mainMenu.map((menu, index) =>
              menu.items !== undefined ? (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger
                    className={cn(
                      "flex items-center py-1 focus:outline-none text-sm font-medium transition-colors hover:text-primary",
                      menu.items
                        .filter((subitem) => subitem.to !== undefined)
                        .map((subitem) => subitem.to)
                        .includes(location.pathname)
                        ? "text-foreground"
                        : "text-foreground/60"
                    )}
                  >
                    {menu.title}
                    <ChevronDownIcon className="ml-1 -mr-1 h-3 w-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48"
                    align="start"
                    forceMount
                  >
                    {menu.items.map((subitem, subindex) =>
                      subitem.to !== undefined ? (
                        <NavLink key={subindex} to={subitem.to}>
                          <DropdownMenuItem
                            className={cn("hover:cursor-pointer", {
                              "bg-muted": subitem.to === location.pathname,
                            })}
                          >
                            {subitem.title}
                          </DropdownMenuItem>
                        </NavLink>
                      ) : subitem.label ? (
                        <DropdownMenuLabel key={subindex}>
                          {subitem.title}
                        </DropdownMenuLabel>
                      ) : (
                        <DropdownMenuSeparator key={subindex} />
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <NavLink
                  key={index}
                  to={menu.to ?? ""}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      isActive ? "text-foreground" : "text-foreground/60"
                    )
                  }
                >
                  {menu.title}
                </NavLink>
              )
            )}
          </nav>
        </div>
        {/* mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            {/* <Button
              variant="ghost"
              className="mr-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <ViewVerticalIcon className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button> */}
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-2"
            >
                      <Icons.logo className="w-8 h-8" /> <p className="font-bold text-base ">ETV Bharat</p>
            </NavLink>
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-8 pl-8">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={
                  "item-" +
                  mainMenu.findIndex((item) =>
                    item.items !== undefined
                      ? item.items
                          .filter((subitem) => subitem.to !== undefined)
                          .map((subitem) => subitem.to)
                          .includes(location.pathname)
                      : false
                  )
                }
              >
                <div className="flex flex-col space-y-3">
                  {mainMenu.map((menu, index) =>
                    menu.items !== undefined ? (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-b-0 pr-6"
                      >
                        <AccordionTrigger
                          className={cn(
                            "py-1 hover:no-underline hover:text-primary [&[data-state=open]]:text-primary",
                            menu.items
                              .filter((subitem) => subitem.to !== undefined)
                              .map((subitem) => subitem.to)
                              .includes(location.pathname)
                              ? "text-foreground"
                              : "text-foreground/60"
                          )}
                        >
                          <div className="flex">{menu.title}</div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-1 pl-4">
                          <div className="mt-1">
                            {menu.items.map((submenu, subindex) =>
                              submenu.to !== undefined ? (
                                <NavLink
                                  key={subindex}
                                  to={submenu.to}
                                  onClick={() => setOpen(false)}
                                  className={({ isActive }) =>
                                    cn(
                                      "block justify-start py-1 h-auto font-normal hover:text-primary",
                                      isActive
                                        ? "text-foreground"
                                        : "text-foreground/60"
                                    )
                                  }
                                >
                                  {submenu.title}
                                </NavLink>
                              ) : submenu.label !== "" ? null : (
                                <div className="px-3">
                                  {/* <Separator /> */}
                                </div>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <NavLink
                        key={index}
                        to={menu.to ?? ""}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "py-1 text-sm font-medium transition-colors hover:text-primary",
                            isActive ? "text-foreground" : "text-foreground/60"
                          )
                        }
                      >
                        {menu.title}
                      </NavLink>
                    )
                  )}
                </div>
              </Accordion>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <a href="/" className="mr-6 flex items-center space-x-2 md:hidden">
        <Icons.logo className="w-8 h-8" /> <p className="font-bold text-base ">ETV Bharat</p>
          {/* <span className="font-bold inline-block">{appConfig.name}</span> */}
        </a>
        {/* right */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* <CommandMenu /> */}
          </div>
          <nav className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback> {userDetails?.display_name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                    {userDetails?.display_name?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userDetails?.display_name}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.clear();
                    dispatch(loggedIn(false));
                    navigate("/login");
                  }}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
