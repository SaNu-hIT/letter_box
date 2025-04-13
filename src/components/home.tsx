import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Mail, Shield, Sparkles, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Navigation Header */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="text-xl font-semibold text-gray-800">
            LoveLetters
          </span>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a
            href="#how-it-works"
            className="text-gray-600 hover:text-rose-500 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-gray-600 hover:text-rose-500 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-gray-600 hover:text-rose-500 transition-colors"
          >
            FAQ
          </a>
          <a
            href="#contact"
            className="text-gray-600 hover:text-rose-500 transition-colors"
          >
            Contact
          </a>
        </nav>
        <Button
          variant="outline"
          className="hidden md:flex border-rose-400 text-rose-500 hover:bg-rose-50"
        >
          Track My Letter
        </Button>
        <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Send Love. <span className="text-rose-500">Stay Anonymous.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Express your deepest feelings with our beautifully crafted love
            letters, delivered with care and complete anonymity.
          </p>
          <Link to="/create">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 rounded-full text-lg">
              Start Writing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="mt-8 flex justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-rose-400" />
              <span>100% Anonymous</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-1 text-rose-400" />
              <span>Discreet Delivery</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-1 text-rose-400" />
              <span>QR Reply System</span>
            </div>
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative w-full max-w-5xl mt-16"
        >
          <div className="absolute -top-10 -left-10 w-20 h-20 text-pink-200 opacity-50">
            <Sparkles className="w-full h-full" />
          </div>
          <div className="absolute -bottom-10 -right-10 w-20 h-20 text-purple-200 opacity-50">
            <Sparkles className="w-full h-full" />
          </div>
          <img
            src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80"
            alt="Love letter with rose petals"
            className="w-full h-auto rounded-2xl shadow-xl"
          />
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            How It <span className="text-rose-500">Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-rose-100 text-rose-500 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Write Your Letter
                </h3>
                <p className="text-gray-600">
                  Compose your heartfelt message and select a beautiful letter
                  style. We'll handle the printing on premium paper.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-purple-100 text-purple-500 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">We Deliver</h3>
                <p className="text-gray-600">
                  Your letter is delivered in a discreet envelope to your
                  recipient's address with no sender information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-rose-50 to-white">
              <CardContent className="pt-6">
                <div className="bg-rose-100 text-rose-500 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">They Can Reply</h3>
                <p className="text-gray-600">
                  Each letter includes a unique QR code that allows the
                  recipient to respond anonymously if they wish.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-16">
            <Link to="/create">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2">
                Send a Letter Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-b from-purple-50 to-pink-50"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Simple <span className="text-rose-500">Pricing</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border border-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Standard</h3>
                <p className="text-gray-500 mb-4">For the patient romantic</p>
                <p className="text-3xl font-bold mb-6">$9.99</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Premium paper
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Standard delivery (5-7 days)
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    QR code for reply
                  </li>
                </ul>
                <Button className="w-full bg-white border border-rose-500 text-rose-500 hover:bg-rose-50">
                  Choose Standard
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-rose-500 shadow-xl relative transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Premium</h3>
                <p className="text-gray-500 mb-4">For the passionate heart</p>
                <p className="text-3xl font-bold mb-6">$14.99</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Luxury paper with scent
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Express delivery (2-3 days)
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    QR code for reply
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Wax seal with rose petals
                  </li>
                </ul>
                <Button className="w-full bg-rose-500 text-white hover:bg-rose-600">
                  Choose Premium
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Luxury</h3>
                <p className="text-gray-500 mb-4">For the ultimate romantic</p>
                <p className="text-3xl font-bold mb-6">$24.99</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Handmade artisan paper
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Priority delivery (1-2 days)
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    QR code for reply
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Custom wax seal & gift box
                  </li>
                </ul>
                <Button className="w-full bg-white border border-rose-500 text-rose-500 hover:bg-rose-50">
                  Choose Luxury
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Love <span className="text-rose-500">Stories</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-md bg-pink-50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <p className="text-gray-600 italic mb-4">
                  "I never had the courage to tell him how I felt. This service
                  allowed me to express my feelings anonymously. We've been
                  dating for 3 months now!"
                </p>
                <p className="text-right font-medium">- Sarah, 28</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
                    alt="Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <p className="text-gray-600 italic mb-4">
                  "After 15 years of marriage, I wanted to surprise my wife with
                  something different. The luxury letter with rose petals made
                  her cry tears of joy."
                </p>
                <p className="text-right font-medium">- Michael, 42</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-rose-50">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie"
                    alt="Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <p className="text-gray-600 italic mb-4">
                  "I received a mysterious letter with beautiful words. The QR
                  code let me reply without knowing who sent it. We've been
                  exchanging messages for weeks!"
                </p>
                <p className="text-right font-medium">- Jamie, 23</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-20 bg-gradient-to-b from-pink-50 to-white"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-16">
            Frequently Asked <span className="text-rose-500">Questions</span>
          </h2>

          <div className="space-y-6">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  Is it really 100% anonymous?
                </h3>
                <p className="text-gray-600">
                  Yes! We never include any sender information on the letter or
                  envelope. Your payment information is securely processed and
                  never shared with recipients.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  How does the QR reply system work?
                </h3>
                <p className="text-gray-600">
                  Each letter includes a unique QR code that links to a private
                  web page. The recipient can scan it and write a response
                  without knowing who sent the original letter.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  Can I track my letter?
                </h3>
                <p className="text-gray-600">
                  Yes! After sending your letter, you'll receive a tracking code
                  to monitor its status: Printed, In Transit, Delivered, and
                  Reply Received.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">
                  What if I want to reveal my identity later?
                </h3>
                <p className="text-gray-600">
                  You can choose to reveal your identity in your letter or in a
                  reply to their response. It's entirely up to you!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-rose-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Express Your Feelings?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Don't let fear hold you back. Send your anonymous love letter today
            and let your heart speak freely.
          </p>
          <Link to="/create">
            <Button className="bg-white text-rose-500 hover:bg-gray-100 px-8 py-3 text-lg rounded-full">
              Start Writing Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-rose-400" />
                <span className="text-xl font-semibold">LoveLetters</span>
              </div>
              <p className="text-gray-400">
                Express your feelings anonymously with our premium love letter
                service.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    Track My Letter
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-rose-400 transition-colors"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: hello@loveletters.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Hours: Mon-Fri, 9am-5pm EST</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LoveLetters. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
