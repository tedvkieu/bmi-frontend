// components/BannerClient.tsx
import Image from "next/image";

export default function BannerClient() {
  return (
    <div className="relative w-full h-[541px]">
      {/* Background Image */}
      <Image
        src="/images/Banner-1-VESC.jpg" 
        alt="Banner"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
    </div>
  );
}
