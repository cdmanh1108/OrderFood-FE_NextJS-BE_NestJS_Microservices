"use client";

import { useState } from "react";
import { useUI } from "@/contexts/ui-context";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

export default function CustomerSupportPage() {
  const { setSuccess } = useUI();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    console.log({ name, email, message });
    setSuccess("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");

    setMessage("");
    setName("");
    setEmail("");
  };

  const contactItems = [
    {
      icon: Phone,
      title: "Hotline",
      value: "0367 485 383",
      description: "Phục vụ 24/7",
      href: "tel:0367485383",
      className: "bg-green-50 text-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      value: "cdmanh1108@gmail.com",
      description: "Phản hồi trong 24h",
      href: "mailto:cdmanh1108@gmail.com",
      className: "bg-blue-50 text-blue-600",
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: "80/27 đường số 4, Bình Thọ, Thủ Đức, Hồ Chí Minh",
      description: "Ghé thăm cửa hàng",
      className: "bg-purple-50 text-purple-600",
    },
    {
      icon: Clock,
      title: "Giờ mở cửa",
      value: "Thứ 2 - Chủ nhật: 8:00 - 22:00",
      description: "Giao hàng đến 21:30",
      className: "bg-orange-50 text-orange-600",
    },
  ];

  const faqs = [
    "Làm sao để đặt hàng?",
    "Chính sách giao hàng như thế nào?",
    "Làm sao để hủy/đổi đơn hàng?",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-beige/50 via-white to-brand-amber/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Trung tâm hỗ trợ
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Hỗ trợ khách hàng
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn về đặt hàng, giao hàng và
                trải nghiệm tại Bún Đậu Làng Mơ.
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
            {contactItems.map((item) => {
              const Icon = item.icon;

              const content = (
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-amber/30 hover:shadow-md">
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.className}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-bold text-brand-brown">{item.title}</h3>

                  <p className="mt-1 text-sm font-semibold text-brand-amber">
                    {item.value}
                  </p>

                  <p className="mt-1 text-sm text-brand-gray-600">
                    {item.description}
                  </p>
                </div>
              );

              return item.href ? (
                <a key={item.title} href={item.href}>
                  {content}
                </a>
              ) : (
                <div key={item.title}>{content}</div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_440px]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-brand-amber/20 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige">
                  <Sparkles className="h-6 w-6 text-brand-amber" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-brand-brown">
                    Câu hỏi thường gặp
                  </h2>
                  <p className="mt-1 text-sm text-brand-gray-600">
                    Một vài vấn đề khách hàng thường cần hỗ trợ.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <button
                    type="button"
                    key={faq}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left font-semibold text-brand-brown transition hover:border-brand-amber/30 hover:bg-brand-beige/50"
                  >
                    <span>{faq}</span>
                    <ChevronDown className="h-5 w-5 text-brand-amber" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Cần hỗ trợ nhanh?
              </p>

              <h2 className="mt-3 text-2xl font-bold text-white">
                Gọi hotline để được hỗ trợ ngay
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Với các vấn đề liên quan đến đơn đang giao hoặc thay đổi đơn
                hàng, gọi hotline sẽ nhanh hơn gửi biểu mẫu.
              </p>

              <a
                href="tel:0367485383"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-brown transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Phone className="h-4 w-4" />
                Gọi 0367 485 383
              </a>
            </div>
          </section>

          <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige">
                <MessageCircle className="h-6 w-6 text-brand-amber" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-brand-brown">
                  Gửi tin nhắn
                </h2>
                <p className="mt-1 text-sm text-brand-gray-600">
                  Chúng tôi sẽ phản hồi sớm nhất.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-brown">
                  Họ và tên <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  placeholder="Nhập họ và tên"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-amber focus:ring-4 focus:ring-brand-amber/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-brown">
                  Email <span className="text-red-500">*</span>
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-amber focus:ring-4 focus:ring-brand-amber/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-brand-brown">
                  Nội dung <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  rows={6}
                  className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-brand-amber focus:ring-4 focus:ring-brand-amber/10"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-amber px-5 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-yellow hover:shadow-md"
              >
                <Send className="h-5 w-5" />
                Gửi tin nhắn
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}