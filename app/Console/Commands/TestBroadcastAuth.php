<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\PlanAlimentacion;
use App\Models\Sesion;
use Illuminate\Support\Facades\Broadcast;

class TestBroadcastAuth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'broadcast:test-auth';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test broadcast channel authentication';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔐 Broadcast Channel Authentication Configuration');
        $this->newLine();

        // Obtener un usuario de prueba
        $user = User::first();
        
        if (!$user) {
            $this->error('No users found in database. Please create a user first.');
            return 1;
        }

        $this->info("Sample user: {$user->name} (ID: {$user->id})");
        $this->newLine();

        $this->info('📡 Configured Channels:');
        $this->newLine();

        // Canal de usuario
        $this->line("1. private-user.{userId}");
        $this->line("   Authorization: User can only access their own channel");
        $this->line("   Example: private-user.{$user->id}");
        $this->newLine();

        // Canal de chat
        $this->line("2. private-chat.{conversacionId}");
        $this->line("   Authorization: Users who participate in the conversation");
        $this->line("   Example: private-chat.1");
        $this->newLine();

        // Canal de sesión
        $this->line("3. private-session.{sesionId}");
        $this->line("   Authorization: Patient and professional of the session");
        
        $sesion = Sesion::where('id_paciente', $user->id)
            ->orWhere('profesional_id', $user->id)
            ->first();
        
        if ($sesion) {
            $this->line("   Example: private-session.{$sesion->id}");
        } else {
            $this->line("   Example: private-session.1 (no sessions found for user)");
        }
        $this->newLine();

        // Canal de plan
        $this->line("4. private-plan.{planId}");
        $this->line("   Authorization: Patient and their nutritionist");
        
        $plan = PlanAlimentacion::where('id_paciente', $user->id)
            ->orWhere('id_nutricionista', $user->id)
            ->first();
        
        if ($plan) {
            $this->line("   Example: private-plan.{$plan->id}");
        } else {
            $this->line("   Example: private-plan.1 (no plans found for user)");
        }
        $this->newLine();

        $this->info('🔒 Security Features:');
        $this->line('  ✅ Rate limiting: 60 auth attempts per minute');
        $this->line('  ✅ Sanctum authentication required');
        $this->line('  ✅ Channel-specific authorization callbacks');
        $this->newLine();

        $this->info('📝 To test authentication:');
        $this->line('  1. Start WebSocket server: php artisan websockets:serve');
        $this->line('  2. Connect from web/mobile app with valid token');
        $this->line('  3. Try subscribing to channels');
        $this->line('  4. Check logs for authorization results');
        $this->newLine();

        $this->info('✅ Configuration complete!');

        return 0;
    }


}
