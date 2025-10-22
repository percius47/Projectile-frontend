// src/components/VendorDetailsModal.tsx
import { Quote } from "@/services/quoteService";

interface VendorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorDetails: Quote["vendor_details"];
}

export default function VendorDetailsModal({
  isOpen,
  onClose,
  vendorDetails,
}: VendorDetailsModalProps) {
  if (!isOpen || !vendorDetails) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div
          className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-base font-semibold leading-6 text-gray-900">
                Vendor Details
              </h3>

              <div className="mt-4 space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Basic Information
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vendorDetails.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Company</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vendorDetails.company_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-900">
                        {vendorDetails.email}
                      </span>
                    </div>
                  </div>
                </div>

                {(vendorDetails.contact_person ||
                  vendorDetails.phone ||
                  vendorDetails.address ||
                  vendorDetails.gst_number) && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      Additional Details
                    </h4>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {vendorDetails.contact_person && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            Contact Person
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vendorDetails.contact_person}
                          </span>
                        </div>
                      )}
                      {vendorDetails.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Phone</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vendorDetails.phone}
                          </span>
                        </div>
                      )}
                      {vendorDetails.address && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Address</span>
                          <span className="text-sm font-medium text-gray-900">
                            {vendorDetails.address}
                          </span>
                        </div>
                      )}
                      {vendorDetails.gst_number && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">
                            GST Number
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {vendorDetails.gst_number}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
