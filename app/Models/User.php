<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'foto_perfil',
        'telefono',
        'fecha_nacimiento',
        'preferences',
        'notification_settings',
        'verification_token',
        'verification_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'fecha_nacimiento' => 'date',
            'preferences' => 'array',
            'notification_settings' => 'array',
            'verification_expires_at' => 'datetime',
        ];
    }

    // Relaciones
    public function nutricionista()
    {
        return $this->hasOne(Nutricionista::class);
    }

    public function paciente()
    {
        return $this->hasOne(Paciente::class, 'user_id');
    }
    
    public function evaluaciones()
    {
        return $this->hasMany(Evaluacion::class, 'id_paciente');
    }

    // Helpers
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isNutricionista()
    {
        return $this->role === 'nutricionista';
    }

    public function isPaciente()
    {
        return $this->role === 'paciente';
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token, $this->email));
    }
}
