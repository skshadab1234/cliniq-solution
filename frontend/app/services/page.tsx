'use client'
import { motion } from "framer-motion"
import Header from '@/components/Header'

export default function Services() {
    const services = [
        {
            icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
            title: "Electronic Health Records",
            description: "Comprehensive EHR system that centralizes patient data, streamlines documentation, and ensures seamless information sharing across healthcare teams.",
            features: ["Real-time patient data access", "Secure cloud storage", "HIPAA compliant"],
            color: "blue"
        },
        {
            icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
            title: "Telemedicine Platform",
            description: "Connect with patients remotely through our secure video consultation platform with integrated scheduling and payment processing.",
            features: ["HD video consultations", "Appointment scheduling", "Prescription management"],
            color: "green"
        },
        {
            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
            title: "Patient Management",
            description: "Complete patient lifecycle management from registration to follow-up care with automated reminders and communication tools.",
            features: ["Patient registration", "Automated reminders", "Communication tools"],
            color: "purple"
        },
        {
            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            title: "Analytics & Reporting",
            description: "Comprehensive analytics dashboard providing insights into patient outcomes, operational efficiency, and financial performance.",
            features: ["Real-time dashboards", "Custom reports", "Performance metrics"],
            color: "orange"
        },
        {
            icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
            title: "Billing & Payments",
            description: "Streamlined billing system with integrated payment processing, insurance verification, and automated invoicing.",
            features: ["Automated billing", "Insurance integration", "Payment tracking"],
            color: "emerald"
        },
        {
            icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
            title: "Mobile App",
            description: "Native mobile applications for both patients and providers, enabling access to healthcare services anywhere, anytime.",
            features: ["iOS & Android apps", "Offline capabilities", "Push notifications"],
            color: "indigo"
        }
    ]

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
                            Our Services
                        </motion.h1>
                        <motion.p
                            className="text-xl text-slate-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Comprehensive healthcare solutions designed to improve patient care and streamline operations
                        </motion.p>
                    </div>
                </div>
            </motion.section>

            {/* Services Grid */}
            <motion.section
                className="py-16 bg-slate-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-16 h-16 bg-${service.color}-100 rounded-xl flex items-center justify-center mb-6`}>
                                    <svg className={`w-8 h-8 text-${service.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">{service.title}</h3>
                                <p className="text-slate-600 mb-6">{service.description}</p>
                                <ul className="space-y-2 text-slate-600">
                                    {service.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Pricing Section */}
            <motion.section
                className="py-16 bg-white"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-3xl font-bold text-slate-800 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            Simple, Transparent Pricing
                        </motion.h2>
                        <motion.p
                            className="text-lg text-slate-600"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            Choose the plan that fits your practice
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Starter",
                                price: "$99",
                                period: "/month",
                                features: ["Up to 5 providers", "Basic EHR", "Email support"],
                                popular: false
                            },
                            {
                                name: "Professional",
                                price: "$199",
                                period: "/month",
                                features: ["Up to 25 providers", "Full EHR + Telemedicine", "Analytics & Reporting", "Priority support"],
                                popular: true
                            },
                            {
                                name: "Enterprise",
                                price: "Custom",
                                period: "",
                                features: ["Unlimited providers", "All features included", "Custom integrations", "Dedicated support"],
                                popular: false
                            }
                        ].map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                className={`rounded-2xl p-8 ${plan.popular ? 'bg-slate-800 text-white relative' : 'bg-slate-50'}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                                    </div>
                                )}
                                <h3 className={`text-2xl font-bold mb-4 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                                <div className="mb-6">
                                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.price}</span>
                                    <span className={`${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <svg className={`w-5 h-5 ${plan.popular ? 'text-green-400' : 'text-green-500'} mr-3`} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className={plan.popular ? 'text-slate-200' : 'text-slate-600'}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <motion.button
                                    className={`w-full font-semibold py-3 rounded-lg transition-colors duration-200 ${plan.popular
                                        ? 'bg-white text-slate-800 hover:bg-slate-100'
                                        : 'bg-slate-800 text-white hover:bg-slate-700'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                className="py-16 bg-slate-800"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h2
                        className="text-3xl font-bold text-white mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        Ready to Get Started?
                    </motion.h2>
                    <motion.p
                        className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        Join thousands of healthcare providers who trust CLINIQ to deliver better patient outcomes.
                    </motion.p>
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <motion.button
                            className="bg-white text-slate-800 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Free Trial
                        </motion.button>
                        <motion.button
                            className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-slate-800 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Schedule Demo
                        </motion.button>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    )
}
