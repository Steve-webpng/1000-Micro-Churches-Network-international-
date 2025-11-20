
import React, { memo } from 'react';
import { GivingRecord } from '../types';
import { IconPhone, IconBuilding, IconChartBar } from '../components/Icons';

const TithePage: React.FC = () => {
    
    // Placeholder data for giving history
    const givingHistory: GivingRecord[] = [
        { id: '1', date: '2024-07-21', amount: 50000, type: 'Tithe', method: 'Mobile Money' },
        { id: '2', date: '2024-07-14', amount: 45000, type: 'Tithe', method: 'Mobile Money' },
        { id: '3', date: '2024-07-10', amount: 20000, type: 'Offering', method: 'In-Person' },
        { id: '4', date: '2024-06-30', amount: 100000, type: 'Special Gift', method: 'Bank' },
    ];

    return (
        <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Tithe & Offering</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">Your faithful giving enables us to spread the Gospel and support our community. Thank you for your generosity.</p>
            </div>

            {/* Inspirational Verse */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg text-center border border-slate-100 dark:border-slate-700 mb-12">
                <p className="text-xl font-serif text-slate-700 dark:text-slate-200">"Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the LORD of hosts, if I will not open the windows of heaven for you and pour down for you a blessing until there is no more need."</p>
                <cite className="block mt-4 text-slate-500 dark:text-slate-400 not-italic font-semibold tracking-wide uppercase text-sm">Malachi 3:10</cite>
            </div>

            {/* Giving Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Mobile Money */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600 dark:text-primary-400"><IconPhone className="w-6 h-6"/></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mobile Money</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Send your contribution directly from your mobile phone.</p>
                    <div className="space-y-3 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-bold text-slate-700 dark:text-slate-200">MTN Mobile Money:</p>
                            <p className="text-slate-500 dark:text-slate-400">+256 772 123456</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-bold text-slate-700 dark:text-slate-200">Airtel Money:</p>
                            <p className="text-slate-500 dark:text-slate-400">+256 752 987654</p>
                        </div>
                    </div>
                </div>

                {/* Bank Transfer */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg text-primary-600 dark:text-primary-400"><IconBuilding className="w-6 h-6"/></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Bank Transfer</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">For direct bank deposits or wire transfers.</p>
                     <div className="space-y-3 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-semibold text-slate-700 dark:text-slate-200">Bank Name: <span className="font-normal text-slate-500 dark:text-slate-400">Centenary Bank</span></p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">Account Name: <span className="font-normal text-slate-500 dark:text-slate-400">1000 Micro Churches Network</span></p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">Account Number: <span className="font-normal text-slate-500 dark:text-slate-400">3100123456</span></p>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">SWIFT Code: <span className="font-normal text-slate-500 dark:text-slate-400">CERBUGKA</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* In-Person Giving */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center mb-12">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">In-Person Giving</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">You can also give your tithes and offerings in person during any of our church services.</p>
             </div>


            {/* Giving History */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3"><IconChartBar className="w-5 h-5 text-primary-500"/> Giving History</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">This feature is coming soon! Below is a sample of how your giving history will appear once you log in.</p>
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                         <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                             <tr>
                                 <th scope="col" className="px-6 py-3">Date</th>
                                 <th scope="col" className="px-6 py-3">Amount (UGX)</th>
                                 <th scope="col" className="px-6 py-3">Type</th>
                                 <th scope="col" className="px-6 py-3">Method</th>
                             </tr>
                         </thead>
                         <tbody>
                             {givingHistory.map(record => (
                                 <tr key={record.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                     <td className="px-6 py-4">{record.date}</td>
                                     <td className="px-6 py-4">{record.amount.toLocaleString()}</td>
                                     <td className="px-6 py-4">{record.type}</td>
                                     <td className="px-6 py-4">{record.method}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
            </div>
        </div>
    );
};

export default memo(TithePage);