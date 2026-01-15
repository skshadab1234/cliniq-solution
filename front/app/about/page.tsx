'use client'
import { motion } from "framer-motion"
import Header from '@/components/Header'

export default function About() {
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
                            About CLINIQ
                        </motion.h1>
                        <motion.p
                            className="text-xl text-slate-600 max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            Revolutionizing healthcare through innovative technology solutions
                        </motion.p>
                    </div>
                </div>
            </motion.section>

            {/* Mission Section */}
            <motion.section
                className="py-16 bg-slate-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Mission</h2>
                            <p className="text-lg text-slate-600 mb-6">
                                At CLINIQ, we are dedicated to transforming healthcare delivery through
                                cutting-edge technology solutions. Our mission is to make quality healthcare
                                accessible, efficient, and patient-centered.
                            </p>
                            <p className="text-lg text-slate-600">
                                We believe that technology should enhance the human touch in healthcare,
                                not replace it. Our solutions empower healthcare providers to deliver
                                better outcomes while improving the patient experience.
                            </p>
                        </motion.div>
                        <motion.div
                            className="bg-slate-800 rounded-2xl p-8 text-white"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                            <p className="text-slate-200">
                                To be the leading healthcare technology platform that connects patients,
                                providers, and healthcare systems in a seamless, efficient, and
                                compassionate ecosystem.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Values Section */}
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
                            Our Values
                        </motion.h2>
                        <motion.p
                            className="text-lg text-slate-600"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            viewport={{ once: true }}
                        >
                            The principles that guide everything we do
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                                title: "Compassion",
                                description: "We put patients at the center of everything we do, ensuring our solutions enhance the human connection in healthcare.",
                                color: "blue"
                            },
                            {
                                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                                title: "Excellence",
                                description: "We strive for the highest standards in everything we do, from product development to customer service.",
                                color: "green"
                            },
                            {
                                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                                title: "Innovation",
                                description: "We continuously push the boundaries of what's possible in healthcare technology to solve real-world problems.",
                                color: "purple"
                            }
                        ].map((value, index) => (
                            <motion.div
                                key={value.title}
                                className="text-center p-6"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                            >
                                <div className={`w-16 h-16 bg-${value.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                    <svg className={`w-8 h-8 text-${value.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={value.icon} />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{value.title}</h3>
                                <p className="text-slate-600">{value.description}</p>
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
                        Ready to Transform Healthcare?
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
                    <motion.button
                        className="bg-white text-slate-800 font-semibold px-8 py-3 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started Today
                    </motion.button>
                </div>
            </motion.section>
        </div>
    )
}
