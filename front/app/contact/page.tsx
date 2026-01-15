'use client'
import { motion } from "framer-motion"
import { useState } from 'react'
import Header from '@/components/Header'

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle form submission here
        console.log('Form submitted:', formData)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <motion.section
                className="bg-white py-16 sm:py-24"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <motion.h1
                            className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            Contact Us
                        </motion.h1>
                        <motion.p
                            className="text-xl text-slate-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Get in touch with our team to learn more about how CLINIQ can transform your healthcare practice
                        </motion.p>
                    </div>
                </div>
            </motion.section>

            {/* Contact Form & Info */}
            <motion.section
                className="py-16 bg-slate-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Send us a message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors duration-200"
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors duration-200"
                                                placeholder="your.email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                                            Company/Organization
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors duration-200"
                                            placeholder="Your company name"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors duration-200"
                                            placeholder="Tell us about your healthcare needs and how we can help..."
                                            required
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        className="w-full bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-slate-700 transition-colors duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Send Message
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Get in touch</h2>
                                    <p className="text-lg text-slate-600 mb-8">
                                        Ready to transform your healthcare practice? Our team is here to help you get started with CLINIQ.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <motion.div
                                        className="flex items-start space-x-4"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Email</h3>
                                            <p className="text-slate-600">hello@cliniq.com</p>
                                            <p className="text-slate-600">support@cliniq.com</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-start space-x-4"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Phone</h3>
                                            <p className="text-slate-600">+1 (555) 123-4567</p>
                                            <p className="text-slate-600">Mon-Fri 9AM-6PM EST</p>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-start space-x-4"
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800 mb-1">Office</h3>
                                            <p className="text-slate-600">123 Healthcare Ave</p>
                                            <p className="text-slate-600">Medical District, NY 10001</p>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Social Links */}
                                <div className="pt-8 border-t border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Follow us</h3>
                                    <div className="flex space-x-4">
                                        {[
                                            { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                                            { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
                                            { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' }
                                        ].map((social) => (
                                            <motion.a
                                                key={social.name}
                                                href="#"
                                                className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-800 hover:text-white transition-colors duration-200"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d={social.icon} />
                                                </svg>
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* FAQ Section */}
            <motion.section
                className="py-16 bg-white"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-3xl font-bold text-slate-800 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            Frequently Asked Questions
                        </motion.h2>
                        <motion.p
                            className="text-lg text-slate-600"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Common questions about CLINIQ and our services
                        </motion.p>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                question: "How quickly can we get started with CLINIQ?",
                                answer: "Most practices can be up and running within 2-4 weeks. Our implementation team works closely with you to ensure a smooth transition and provides comprehensive training for your staff."
                            },
                            {
                                question: "Is CLINIQ HIPAA compliant?",
                                answer: "Yes, CLINIQ is fully HIPAA compliant and follows all healthcare data security standards. We use enterprise-grade encryption and security measures to protect patient data."
                            },
                            {
                                question: "Do you offer training and support?",
                                answer: "Absolutely! We provide comprehensive training for all users, ongoing support, and regular updates. Our support team is available via phone, email, and live chat."
                            },
                            {
                                question: "Can CLINIQ integrate with our existing systems?",
                                answer: "Yes, CLINIQ offers robust integration capabilities with most major healthcare systems, including EHRs, billing systems, and laboratory systems. Our team will help you set up these integrations."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                className="bg-slate-50 rounded-lg p-6"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-lg font-semibold text-slate-800 mb-3">{faq.question}</h3>
                                <p className="text-slate-600">{faq.answer}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    )
}
