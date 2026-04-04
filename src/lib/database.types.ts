export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conselho_mandatos: {
        Row: {
          id: number
          titulo: string
          ano_inicio: number
          ano_fim: number
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: number
          titulo: string
          ano_inicio: number
          ano_fim: number
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          titulo?: string
          ano_inicio?: number
          ano_fim?: number
          ativo?: boolean
          created_at?: string
        }
      }
      conselho_membros: {
        Row: {
          id: number
          mandato_id: number | null
          nome: string
          cargo: string
          foto_url: string | null
          categoria: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: number
          mandato_id?: number | null
          nome: string
          cargo: string
          foto_url?: string | null
          categoria: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: number
          mandato_id?: number | null
          nome?: string
          cargo?: string
          foto_url?: string | null
          categoria?: string
          ordem?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: number
          title: string
          description: string | null
          date: string
          time: string
          location: string
          category: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          date: string
          time: string
          location: string
          category: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          date?: string
          time?: string
          location?: string
          category?: string
          image_url?: string | null
          created_at?: string
        }
      }
      gallery: {
        Row: {
          id: number
          title: string | null
          image_url: string | null
          category: string | null
          event_date: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title?: string | null
          image_url?: string | null
          category?: string | null
          event_date?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string | null
          image_url?: string | null
          category?: string | null
          event_date?: string | null
          created_at?: string
        }
      }
      group_coordinator_history: {
        Row: {
          id: number
          group_id: number
          nome: string
          gestao: string
          foto_url: string | null
          mandato_id: number | null
          ordem: number
          created_at: string
        }
        Insert: {
          id?: number
          group_id: number
          nome: string
          gestao: string
          foto_url?: string | null
          mandato_id?: number | null
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: number
          group_id?: number
          nome?: string
          gestao?: string
          foto_url?: string | null
          mandato_id?: number | null
          ordem?: number
          created_at?: string
        }
      }
      groups: {
        Row: {
          id: number
          nome: string
          dia: string
          local: string
          cidade: string
          geolocalizacao: string | null
          coordenador: string | null
          coordenador_foto_url: string | null
          mandato_id: number | null
          whatsapp: string | null
          site: string | null
          facebook: string | null
          instagram: string | null
          slug: string | null
          imagem?: string | null
          descricao?: string | null
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          dia: string
          local: string
          cidade: string
          geolocalizacao?: string | null
          coordenador?: string | null
          coordenador_foto_url?: string | null
          mandato_id?: number | null
          whatsapp?: string | null
          site?: string | null
          facebook?: string | null
          instagram?: string | null
          slug?: string | null
          imagem?: string | null
          descricao?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          dia?: string
          local?: string
          cidade?: string
          geolocalizacao?: string | null
          coordenador?: string | null
          coordenador_foto_url?: string | null
          mandato_id?: number | null
          whatsapp?: string | null
          site?: string | null
          facebook?: string | null
          instagram?: string | null
          slug?: string | null
          imagem?: string | null
          descricao?: string | null
          created_at?: string
        }
      }
      ministerio_coordinator_history: {
        Row: {
          id: number
          ministerio_id: number
          nome: string
          gestao: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: number
          ministerio_id: number
          nome: string
          gestao: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: number
          ministerio_id?: number
          nome?: string
          gestao?: string
          ordem?: number
          created_at?: string
        }
      }
      ministerios: {
        Row: {
          id: number
          nome: string
          descricao: string | null
          coordenador: string | null
          bienio: string | null
          imagem_url: string | null
          cor: string | null
          ordem: number
          created_at: string
        }
        Insert: {
          id?: number
          nome: string
          descricao?: string | null
          coordenador?: string | null
          bienio?: string | null
          imagem_url?: string | null
          cor?: string | null
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: number
          nome?: string
          descricao?: string | null
          coordenador?: string | null
          bienio?: string | null
          imagem_url?: string | null
          cor?: string | null
          ordem?: number
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          title: string
          content: string
          excerpt: string | null
          image_url: string | null
          category: string | null
          author: string | null
          slug: string | null
          date: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          excerpt?: string | null
          image_url?: string | null
          category?: string | null
          author?: string | null
          slug?: string | null
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          excerpt?: string | null
          image_url?: string | null
          category?: string | null
          author?: string | null
          slug?: string | null
          date?: string | null
          created_at?: string
        }
      }
      prayer_requests: {
        Row: {
          id: number
          name: string
          message: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          message: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          message?: string
          created_at?: string
        }
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

