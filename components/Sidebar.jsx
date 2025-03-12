"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { usePathname, useParams } from "next/navigation";

export default function Sidebar() {
  const params = useParams();
  const hasOrgId = !!params.orgId;

  // Set the dropdown to be expanded by default
  const [activeDropdown, setActiveDropdown] = useState("organization");

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  return (
    <aside className="md:w-1/6 card-sm shadow flex flex-col px-0">
      <ul>
        <li className="py-2 hover:backdrop-brightness-95 cursor-pointer">
          <a className="block py-2 px-4" href="/dashboard">Dashboard</a>
        </li>

        <li>
          <div
            className="flex justify-between items-center cursor-pointer py-2 px-4 hover:backdrop-brightness-95"
            onClick={() => toggleDropdown("organization")}
          >
            <div className="flex-grow text-center">Organization</div>
            <FaChevronDown
              className={`w-4 h-4 transition-transform ${
                activeDropdown === "organization" ? "rotate-180" : ""
              }`}
            />
          </div>

          {activeDropdown === "organization" && (
            <ul>
              <li className="hover:backdrop-brightness-95">
                <a href="/organizations" className="block py-2 px-4 cursor-pointer hover:backdrop-brightness-95">
                  Organization List
                </a>
              </li>

              {hasOrgId && (
                <>
                  <li className="hover:backdrop-brightness-95">
                    <a
                      href={`/organization/${params.orgId}/chatrooms`}
                      className="block py-2 px-4 cursor-pointer hover:backdrop-brightness-95"
                    >
                      Chatrooms
                    </a>
                  </li>
                  <li className="hover:backdrop-brightness-95">
                    <a
                      href={`/organization/${params.orgId}/CRM`}
                      className="block py-2 px-4 cursor-pointer hover:backdrop-brightness-95"
                    >
                      CRM
                    </a>
                  </li>
                  <li className="hover:backdrop-brightness-95">
                    <a
                      href={`/organization/${params.orgId}/task-management`}
                      className="block py-2 px-4 cursor-pointer hover:backdrop-brightness-95"
                    >
                      Task Management
                    </a>
                  </li>
                </>
              )}
            </ul>
          )}
        </li>
      </ul>
    </aside>
  );
}
