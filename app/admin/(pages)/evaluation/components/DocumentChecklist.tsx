// components/DocumentChecklist.tsx
import { DocumentType, DocumentCheckData } from "../types/evaluation";

interface DocumentChecklistProps {
  documentTypes: DocumentType[];
  documentCheckData: DocumentCheckData;
  onDocumentCheckChange: (
    documentTypeId: number,
    type: "hasHardCopy" | "hasElectronic",
    value: boolean
  ) => void;
}

export default function DocumentChecklist({
  documentTypes,
  documentCheckData,
  onDocumentCheckChange,
}: DocumentChecklistProps) {
  const customerDocuments = documentTypes
    .filter((doc) => doc.category === "CUSTOMER" && doc.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const bmiDocuments = documentTypes
    .filter((doc) => doc.category === "BMI" && doc.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const renderDocumentTable = (
    documents: DocumentType[],
    title: string,
    maxRows: number
  ) => (
    <div>
      <div className="bg-blue-100 p-3 mb-4 rounded border border-gray-300">
        <h3 className="text-base font-bold text-center text-gray-800">
          {title}
        </h3>
      </div>

      <div className="border border-gray-400">
        {/* Header */}
        <div className="grid grid-cols-10 text-gray-700 bg-gray-100 border-b border-gray-400">
          <div className="col-span-1 text-gray-700 p-2 text-center font-bold text-xs border-r border-gray-400">
            STT
          </div>
          <div className="col-span-6 p-2 text-center font-bold text-xs border-r border-gray-400">
            Tên hồ sơ/ tài liệu
          </div>
          <div className="col-span-1 p-2 text-center font-bold text-xs border-r border-gray-400">
            HS
            <br />
            Giấy
          </div>
          <div className="col-span-2 p-2 text-center font-bold text-xs">
            HS
            <br />
            điện tử
            <br />
            (*)
          </div>
        </div>

        {/* Document rows */}
        {documents.map((doc, index) => (
          <div
            key={doc.documentTypeId}
            className="grid grid-cols-10 border-b border-gray-300 min-h-[40px] items-center"
          >
            <div className="col-span-1 p-2 text-center text-xs border-r border-gray-300 text-gray-700">
              {index + 1}
            </div>
            <div className="col-span-6 p-2 text-xs border-r border-gray-300 text-gray-700">
              <div>{doc.typeName}</div>
              {doc.typeNameEnglish && (
                <div className="text-gray-500 italic">
                  ({doc.typeNameEnglish})
                </div>
              )}
            </div>
            <div className="col-span-1 p-2 text-center border-r border-gray-300">
              <input
                type="checkbox"
                checked={
                  documentCheckData[doc.documentTypeId]?.hasHardCopy || false
                }
                onChange={(e) =>
                  onDocumentCheckChange(
                    doc.documentTypeId,
                    "hasHardCopy",
                    e.target.checked
                  )
                }
                className="h-4 w-4"
              />
            </div>
            <div className="col-span-2 p-2 text-center">
              <input
                type="checkbox"
                checked={
                  documentCheckData[doc.documentTypeId]?.hasElectronic || false
                }
                onChange={(e) =>
                  onDocumentCheckChange(
                    doc.documentTypeId,
                    "hasElectronic",
                    e.target.checked
                  )
                }
                className="h-4 w-4"
              />
            </div>
          </div>
        ))}

        {/* Empty rows */}
        {Array.from({ length: Math.max(0, maxRows - documents.length) }).map(
          (_, index) => (
            <div
              key={`empty-${index}`}
              className="grid grid-cols-10 border-b border-gray-300 min-h-[40px]"
            >
              <div className="col-span-1 p-2 text-center text-xs border-r border-gray-300"></div>
              <div className="col-span-6 p-2 text-xs border-r border-gray-300"></div>
              <div className="col-span-1 p-2 text-center border-r border-gray-300">
                <input type="checkbox" className="h-4 w-4" disabled />
              </div>
              <div className="col-span-2 p-2 text-center">
                <input type="checkbox" className="h-4 w-4" disabled />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  if (documentTypes.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-xl text-gray-800 font-bold mb-6 text-center">
        4/ DANH MỤC HỒ SƠ GIÁM ĐỊNH
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Documents Column */}
        {renderDocumentTable(customerDocuments, "A. Khách hàng cung cấp", 14)}

        {/* BMI Documents Column */}
        {renderDocumentTable(bmiDocuments, "B. Công ty BMI lập", 12)}
      </div>

      {/* Note */}
      <div className="mt-6 text-sm text-gray-700">
        <p>(*) Hồ sơ điện tử được lưu theo đường dẫn sau:</p>
        <div className="mt-4 flex justify-end">
          <div className="text-center">
            <p className="italic">Ngày..... tháng..... năm 20...</p>
            <p className="mt-2 font-semibold">Người theo dõi</p>
            <p className="text-xs italic mt-1">(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
