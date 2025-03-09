"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa"; // Import the chevron-down icon
import { usePathname, useParams } from "next/navigation"; // Import Next.js navigation hooks

export default function Sidebar() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname(); // Get the current URL path
  const params = useParams(); // Get the dynamic route parameters

  // Check if the current URL contains an orgId
  const hasOrgId = !!params.orgId;

  // Toggle dropdown visibility
  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  return (
    <aside className="md:w-1/6 card-sm shadow flex flex-col px-0">
      <ul>
        {/* Dashboard Link */}
        <li className="py-2 hover:backdrop-brightness-95 cursor-pointer">
          <a className="block py-2 px-4" href="/dashboard">Dashboard</a>
        </li>

        {/* Dropdown for Organization-Specific Links */}
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

          {/* Dropdown Content */}
          {activeDropdown === "organization" && (
            <ul className="">
              {/* Always show the "Organization List" link */}
              <li className="hover:backdrop-brightness-95">
                <a
                  href="/organizations"
                  className="block py-2 px-4 cursor-pointer hover:backdrop-brightness-95"
                >
                  Organization List
                </a>
              </li>

              {/* Conditionally show links that require orgId */}
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