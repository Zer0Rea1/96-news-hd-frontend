import React from "react";
import { useParams } from "react-router-dom";
import LatestNewsSidebar from "../components/LatestNewsSidebar";

const posts = [
  {
    slug: "pm-china-visit",
    title: "وزیراعظم کا دورہ چین: اہم معاہدوں پر دستخط",
    image: "https://urdu.arynews.tv/wp-content/uploads/2025/01/1-4-696x386.jpg",
    content:
      "وزیراعظم نے چین کے دورے کے دوران کئی اہم معاہدوں پر دستخط کیے۔ ان معاہدوں سے دونوں ملکوں کے درمیان تعلقات مزید مضبوط ہونے کی توقع ہے۔ چین کے صدر شی جن پنگ نے وزیراعظم کا گرم جوشی سے استقبال کیا۔ دونوں رہنماؤں نے دو طرفہ تعلقات، علاقائی امن و استحکام اور عالمی امور پر تبادلہ خیال کیا۔ وزیراعظم نے پاکستان میں چینی سرمایہ کاری کے مواقع پر زور دیا اور سی پیک منصوبوں کی تیز رفتاری سے تکمیل کی اہمیت پر بھی بات کی۔ چینی صدر نے پاکستان کی معاشی ترقی اور خوشحالی کے لیے مکمل تعاون کا یقین دلایا۔",
  },
  {
    slug: "new-covid-vaccine",
    title: "کورونا وائرس: نئی ویکسین کی کامیاب آزمائش",
    content:
      "سائنسدانوں نے کورونا وائرس کی نئی ویکسین کی کامیاب آزمائش کا اعلان کیا ہے۔ اس ویکسین کے استعمال سے وائرس کے نئے ویریئنٹس سے بھی تحفظ ملنے کی امید ہے۔ تجرباتی مرحلے میں اس ویکسین نے 95 فیصد تک مؤثر ہونے کا مظاہرہ کیا ہے۔ ماہرین کا کہنا ہے کہ یہ ویکسین موجودہ ویکسینز کے مقابلے میں زیادہ موثر اور محفوظ ہے۔ اس کے ضمنی اثرات بھی کم ہیں۔ عالمی ادارہ صحت نے اس پیش رفت کو خوش آئند قرار دیا ہے۔ توقع ہے کہ اگلے چند ماہ میں یہ ویکسین عام استعمال کے لیے دستیاب ہو جائے گی۔",
  },
];

const PostPage = () => {
  const { slug } = useParams();

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return <div className="container mx-auto py-8 px-4">پوسٹ نہیں ملی</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
        <img
          src={post.image}
          alt=""
          className="w-full h-auto object-cover rounded-lg"
        />
        <h1 className="text-3xl font-bold mb-6 mt-6 font-jameel-noori">
          {post.title}
        </h1>
        <p className="text-xl font-jameel-noori leading-10">{post.content}</p>
      </div>
      <div className="md:col-span-1">
          <LatestNewsSidebar latestNews={posts}  />
      </div>
      <HtmlComponent/>
    </div>
  );
};




const HtmlComponent = () => {
  return (
    <>
      <div className="bg-white p-6 md:col-span-2 rounded-lg">
          <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="mt-6 mb-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </>
  );
};




export default PostPage;
