import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
	icon: React.ElementType;
	label: string;
	value: string;
	bgColor: string;
	iconColor: string;
};

const StatsCard = ({ bgColor, icon: Icon, iconColor, label, value }: StatsCardProps) => {
	return (
		<Card className='bg-[#2e6f57]'>
			<CardContent className='p-6'>
				<div className='flex items-center gap-4'>
					<div className={`p-3 rounded-lg ${bgColor}`}>
						<Icon className={`size-6 ${iconColor}`} />
					</div>
					<div>
						<p className='text-sm text-green-200'>{label}</p>
						<p className='text-2xl font-bold'>{value}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
export default StatsCard;
